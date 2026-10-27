// Aplica en orden los archivos de migrations/ que todavía no se hayan aplicado a la base de DATABASE_URL.
// Uso: pnpm db:migrar   (lee DATABASE_URL de .env)
// Cada archivo corre en una transacción: si falla, no deja nada a medias.
import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL (cópiala en .env, ver .env.example).');
  process.exit(1);
}

const carpeta = new URL('../migrations/', import.meta.url);
const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();

try {
  // Registro de las migraciones ya aplicadas
  await cliente.query('CREATE TABLE IF NOT EXISTS migraciones (nombre TEXT PRIMARY KEY, aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now())');
  const { rows } = await cliente.query('SELECT nombre FROM migraciones');
  const aplicadas = new Set(rows.map((r) => r.nombre));
  const pendientes = (await readdir(carpeta)).filter((a) => a.endsWith('.sql') && !aplicadas.has(a)).sort();

  for (const archivo of pendientes) {
    await cliente.query('BEGIN');
    try {
      await cliente.query(await readFile(new URL(archivo, carpeta), 'utf8'));
      await cliente.query('INSERT INTO migraciones (nombre) VALUES ($1)', [archivo]);
      await cliente.query('COMMIT');
      console.log(`✅ ${archivo}`);
    } catch (e) {
      await cliente.query('ROLLBACK');
      console.error(`❌ ${archivo}: ${e.message}`);
      process.exitCode = 1;
      break;
    }
  }
  if (pendientes.length === 0) console.log('La base ya está al día.');
} finally {
  await cliente.end();
}
