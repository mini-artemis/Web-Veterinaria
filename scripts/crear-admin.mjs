// Crea (o actualiza) un usuario administrador en la base de datos.
// Uso (la contraseña se pide al ejecutarlo, sin mostrarla en pantalla):
//   pnpm crear-admin "Nombre" correo@ejemplo.com            (base local)
//   pnpm crear-admin "Nombre" correo@ejemplo.com --remote   (base en Cloudflare)
// Se pide así porque en la terminal caracteres como $ ! ` \ cambian la contraseña sin avisar.
import { execFileSync } from 'node:child_process';
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const args = process.argv.slice(2);
const destino = args.includes('--remote') ? '--remote' : '--local';
const [nombre, correo, passwordArg] = args.filter((a) => a !== '--remote' && a !== '--local');
if (!nombre || !correo) {
  console.error('Uso: pnpm crear-admin "Nombre" correo@ejemplo.com [--local|--remote]');
  process.exit(1);
}

/** Lee una línea de la terminal sin mostrar lo que se escribe. */
function preguntarOculto(pregunta) {
  process.stdout.write(pregunta);
  if (!process.stdin.isTTY) {
    // Entrada redirigida (p. ej. `echo ... |`): no hay nada que ocultar
    const rl = createInterface({ input: process.stdin });
    return new Promise((resolve) => rl.once('line', (linea) => (rl.close(), process.stdout.write('\n'), resolve(linea))));
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

const sql = (texto) => `'${texto.replaceAll("'", "''")}'`;
const consulta = `INSERT INTO usuarios (nombre, correo, password_hash, rol_id) VALUES (${sql(nombre)}, ${sql(correo.toLowerCase())}, ${sql(hash)}, 1)
  ON CONFLICT(correo) DO UPDATE SET nombre = excluded.nombre, password_hash = excluded.password_hash, rol_id = 1, activo = 1;`;

execFileSync('pnpm', ['wrangler', 'd1', 'execute', 'veterinaria-db', destino, '--command', consulta], { stdio: 'inherit' });
console.log(`\nAdministrador listo: ${correo} (${destino === '--remote' ? 'Cloudflare' : 'local'})`);
