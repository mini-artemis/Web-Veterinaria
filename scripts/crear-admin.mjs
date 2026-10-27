// Crea (o actualiza) un usuario administrador en la base de datos.
// Uso:
//   pnpm crear-admin "Nombre" correo@ejemplo.com "contraseña"            (base local)
//   pnpm crear-admin "Nombre" correo@ejemplo.com "contraseña" --remote   (base en Cloudflare)
import { execFileSync } from 'node:child_process';
import { webcrypto as crypto } from 'node:crypto';

const [nombre, correo, password, destino = '--local'] = process.argv.slice(2);
if (!nombre || !correo || !password || password.length < 8) {
  console.error('Uso: pnpm crear-admin "Nombre" correo@ejemplo.com "contraseña (mín. 8)" [--local|--remote]');
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
console.log(`\nAdministrador listo: ${correo}`);
