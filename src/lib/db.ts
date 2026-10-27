import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { DATABASE_URL } from 'astro:env/server';

// Postgres manda algunos tipos como texto; se convierten a lo que usa el código
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat); // precios
pg.types.setTypeParser(pg.types.builtins.INT8, Number); // count(*)
pg.types.setTypeParser(pg.types.builtins.DATE, (fecha) => fecha); // 'AAAA-MM-DD' tal cual, sin zona horaria

export const pool = new pg.Pool({ connectionString: DATABASE_URL });
// En Vercel cierra las conexiones que quedan sin usar cuando la función se duerme
attachDatabasePool(pool);

/** Ejecuta una consulta y devuelve sus filas. Los valores van como $1, $2... (nunca pegados al SQL). */
export async function consulta<T>(sql: string, valores: unknown[] = []) {
  return (await pool.query(sql, valores)).rows as T[];
}

/** Primera fila de la consulta (undefined si no hay). */
export async function fila<T>(sql: string, valores: unknown[] = []) {
  return (await consulta<T>(sql, valores))[0] as T | undefined;
}

/** Ejecuta varias consultas juntas: si una falla, no se guarda ninguna. */
export async function transaccion<T>(trabajo: (cliente: pg.PoolClient) => Promise<T>) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await trabajo(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

/** El error es por un valor repetido en una columna UNIQUE (correo, código de producto...). */
export const esDuplicado = (e: unknown) => (e as { code?: string })?.code === '23505';
