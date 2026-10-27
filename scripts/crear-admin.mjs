// Crea (o actualiza) un usuario administrador en la base de datos de DATABASE_URL (en .env).
// Uso (la contraseña se pide al ejecutarlo, sin mostrarla en pantalla):
//   pnpm crear-admin "Nombre" correo@ejemplo.com
// Se pide así porque en la terminal caracteres como $ ! ` \ cambian la contraseña sin avisar.
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import pg from 'pg';

const [nombre, correoArg, passwordArg] = process.argv.slice(2);
if (!nombre || !correoArg) {
  console.error('Uso: pnpm crear-admin "Nombre" correo@ejemplo.com');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL (cópiala en .env, ver .env.example).');
  process.exit(1);
}
const correo = correoArg.toLowerCase();

let lineas;

/** Lee una línea de la terminal sin mostrar lo que se escribe. */
function preguntarOculto(pregunta) {
  process.stdout.write(pregunta);
  if (!process.stdin.isTTY) {
    // Entrada redirigida (p. ej. `printf ... |`): no hay nada que ocultar. Se usa un solo lector
    // para todas las preguntas, porque uno nuevo perdería las líneas que el anterior ya leyó.
    lineas ??= createInterface({ input: process.stdin })[Symbol.asyncIterator]();
    return lineas.next().then(({ value }) => (process.stdout.write('\n'), value ?? ''));
  }
  return new Promise((resolve) => {
    let texto = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const alTeclear = (teclas) => {
      for (const c of teclas) {
        if (c === '\r' || c === '\n') {
          process.stdin.off('data', alTeclear);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          return resolve(texto);
        }
        if (c === '\u0003') process.exit(130); // Ctrl+C
        if (c === '\u007f' || c === '\b') texto = texto.slice(0, -1); // Borrar
        else texto += c;
      }
    };
    process.stdin.on('data', alTeclear);
  });
}

let password = passwordArg;
if (!password) {
  password = await preguntarOculto('Contraseña (mín. 8): ');
  if (password !== (await preguntarOculto('Repítela: '))) {
    console.error('Las contraseñas no coinciden.');
    process.exit(1);
  }
}
if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

// Mismo algoritmo que src/lib/auth.ts
const ITERACIONES = 100_000;
const sal = crypto.getRandomValues(new Uint8Array(16));
const llave = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: ITERACIONES }, llave, 256));
const b64 = (bytes) => Buffer.from(bytes).toString('base64');
const hash = `pbkdf2$${ITERACIONES}$${b64(sal)}$${b64(bits)}`;

const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();
try {
  // El usuario y su contraseña (tabla cuentas, que es donde la busca Better Auth) se guardan juntos
  await cliente.query('BEGIN');
  const { rows } = await cliente.query(
    `INSERT INTO usuarios (nombre, correo, rol_id) VALUES ($1, $2, 1)
       ON CONFLICT (correo) DO UPDATE SET nombre = excluded.nombre, rol_id = 1, activo = true, actualizado_en = now()
     RETURNING id`,
    [nombre, correo],
  );
  await cliente.query(
    `INSERT INTO cuentas (cuenta_id, proveedor, usuario_id, password_hash) VALUES ($1, 'credential', $2, $3)
       ON CONFLICT (usuario_id, proveedor) DO UPDATE SET password_hash = excluded.password_hash, actualizado_en = now()`,
    [String(rows[0].id), rows[0].id, hash],
  );
  await cliente.query('COMMIT');
} finally {
  await cliente.end();
}
console.log(`\nAdministrador listo: ${correo}`);
