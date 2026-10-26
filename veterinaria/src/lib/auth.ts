import { env } from 'cloudflare:workers';
import type { AstroCookies } from 'astro';

// ===== Contraseñas =====
// Se guardan con PBKDF2-SHA256 y una "sal" aleatoria por usuario.
// Formato: pbkdf2$iteraciones$sal$hash (en base64). scripts/crear-admin.mjs usa el mismo.
const ITERACIONES = 100_000; // máximo que permite Cloudflare Workers

const aBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const deBase64 = (texto: string) => Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));

async function derivar(password: string, sal: Uint8Array<ArrayBuffer>, iteraciones: number) {
  const llave = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: iteraciones }, llave, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivar(password, sal, ITERACIONES);
  return `pbkdf2$${ITERACIONES}$${aBase64(sal)}$${aBase64(hash)}`;
}

export async function verificarPassword(password: string, guardado: string) {
  const [algoritmo, iteraciones, sal, hash] = guardado.split('$');
  if (algoritmo !== 'pbkdf2') return false;
  const calculado = await derivar(password, deBase64(sal), Number(iteraciones));
  const esperado = deBase64(hash);
  // Comparación en tiempo constante (no da pistas por lo que tarda)
  if (calculado.length !== esperado.length) return false;
  let diferencia = 0;
  for (let i = 0; i < calculado.length; i++) diferencia |= calculado[i] ^ esperado[i];
  return diferencia === 0;
}

// ===== Sesiones =====
export const COOKIE_SESION = 'sesion';
const DURACION_HORAS = 8; // un turno de trabajo

async function sha256(texto: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function crearSesion(usuarioId: number, cookies: AstroCookies, segura: boolean) {
  const token = aBase64(crypto.getRandomValues(new Uint8Array(32)));
  const expira = new Date(Date.now() + DURACION_HORAS * 3600_000);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO sesiones (id, usuario_id, expira_en) VALUES (?, ?, ?)').bind(
      await sha256(token),
      usuarioId,
      expira.toISOString(),
    ),
    env.DB.prepare("UPDATE usuarios SET ultimo_acceso = datetime('now') WHERE id = ?").bind(usuarioId),
    // Limpieza de sesiones vencidas de cualquier usuario
    env.DB.prepare('DELETE FROM sesiones WHERE expira_en < ?').bind(new Date().toISOString()),
  ]);
  cookies.set(COOKIE_SESION, token, {
    httpOnly: true, // JavaScript de la página no la puede leer
    secure: segura, // solo viaja por HTTPS
    sameSite: 'lax', // no se envía en formularios de otros sitios
    path: '/',
    expires: expira,
  });
}

export async function cerrarSesion(cookies: AstroCookies) {
  const token = cookies.get(COOKIE_SESION)?.value;
  if (token) await env.DB.prepare('DELETE FROM sesiones WHERE id = ?').bind(await sha256(token)).run();
  cookies.delete(COOKIE_SESION, { path: '/' });
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  permisos: string[];
}

/** Busca al usuario dueño de la cookie de sesión (null si no hay sesión válida). */
export async function usuarioDeSesion(cookies: AstroCookies): Promise<Usuario | null> {
  const token = cookies.get(COOKIE_SESION)?.value;
  if (!token) return null;
  const fila = await env.DB.prepare(
    `SELECT u.id, u.nombre, u.correo, r.nombre AS rol,
            (SELECT group_concat(p.clave) FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id
              WHERE rp.rol_id = u.rol_id) AS permisos
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
       JOIN roles r ON r.id = u.rol_id
      WHERE s.id = ? AND s.expira_en > ? AND u.activo = 1`,
  )
    .bind(await sha256(token), new Date().toISOString())
    .first<Omit<Usuario, 'permisos'> & { permisos: string | null }>();
  if (!fila) return null;
  return { ...fila, permisos: fila.permisos ? fila.permisos.split(',') : [] };
}

export const puede = (usuario: Usuario | null, permiso: string) => !!usuario?.permisos.includes(permiso);
