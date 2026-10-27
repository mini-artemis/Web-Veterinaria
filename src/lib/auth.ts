import { betterAuth } from 'better-auth';
import { BETTER_AUTH_SECRET } from 'astro:env/server';
import { fila, pool } from './db';

// ===== Contraseñas =====
// Se guardan con PBKDF2-SHA256 y una "sal" aleatoria por usuario.
// Formato: pbkdf2$iteraciones$sal$hash (en base64). scripts/crear-admin.mjs usa el mismo.
// (Better Auth usa scrypt por defecto; se deja PBKDF2 para que scripts/crear-admin.mjs genere el mismo formato.)
const ITERACIONES = 100_000;

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

async function verificarPassword(password: string, guardado: string) {
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

// ===== Better Auth =====
const DURACION_HORAS = 8; // un turno de trabajo

const crearAuth = () =>
  betterAuth({
    database: pool,
    trustHost: true,
    // Firma las cookies de sesión. En .env (local) y en las variables de entorno de Vercel
    secret: BETTER_AUTH_SECRET,
    // Cookies solo por HTTPS fuera de `astro dev`
    advanced: {
      useSecureCookies: !import.meta.env.DEV,
      // Los id son números autoincrementables, como en el resto de las tablas
      database: { generateId: 'serial' },
    },
    emailAndPassword: {
      enabled: true,
      // Nadie se registra solo: las cuentas las crea un administrador (sistema/usuarios o crear-admin)
      disableSignUp: true,
      minPasswordLength: 8,
      password: { hash: hashPassword, verify: ({ hash, password }) => verificarPassword(password, hash) },
    },
    session: {
      expiresIn: DURACION_HORAS * 3600,
      disableSessionRefresh: true, // dura un turno y se acaba, aunque se siga usando
      modelName: 'sesiones',
      fields: {
        token: 'token',
        userId: 'usuario_id',
        expiresAt: 'expira_en',
        ipAddress: 'ip',
        userAgent: 'navegador',
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en',
      },
    },
    // Las tablas y columnas están en español (migrations/0003_better_auth.sql)
    user: {
      modelName: 'usuarios',
      fields: {
        name: 'nombre',
        email: 'correo',
        emailVerified: 'correo_verificado',
        image: 'imagen',
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en',
      },
      additionalFields: {
        rolId: { type: 'number', fieldName: 'rol_id', required: true, input: false },
        activo: { type: 'boolean', defaultValue: true, input: false },
      },
    },
    account: {
      modelName: 'cuentas',
      fields: {
        accountId: 'cuenta_id',
        providerId: 'proveedor',
        userId: 'usuario_id',
        password: 'password_hash',
        accessToken: 'token_acceso',
        refreshToken: 'token_refresco',
        idToken: 'token_id',
        accessTokenExpiresAt: 'token_acceso_expira',
        refreshTokenExpiresAt: 'token_refresco_expira',
        scope: 'alcance',
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en',
      },
    },
    verification: {
      modelName: 'verificaciones',
      fields: {
        identifier: 'identificador',
        value: 'valor',
        expiresAt: 'expira_en',
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en',
      },
    },
    databaseHooks: {
      session: {
        create: {
          // Un usuario desactivado no puede iniciar sesión
          before: async (sesion) => {
            const usuario = await fila<{ activo: boolean }>('SELECT activo FROM usuarios WHERE id = $1', [sesion.userId]);
            if (!usuario?.activo) return false;
          },
          after: async (sesion) => {
            await pool.query('UPDATE usuarios SET ultimo_acceso = now() WHERE id = $1', [sesion.userId]);
            // Limpieza de sesiones vencidas de cualquier usuario
            await pool.query('DELETE FROM sesiones WHERE expira_en < now()');
          },
        },
      },
    },
  });

// Se crea en la primera petición que lo usa, no al compilar las páginas públicas
let instancia: ReturnType<typeof crearAuth> | undefined;
export const getAuth = () => (instancia ??= crearAuth());

/** Redirige conservando las cookies que puso Better Auth (iniciar o cerrar sesión). */
export function redirigirConCookies(cookies: Headers, destino: string) {
  const headers = new Headers({ Location: destino });
  for (const cookie of cookies.getSetCookie()) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

// ===== Usuario de la sesión =====
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  permisos: string[];
}

/** Busca al usuario dueño de la cookie de sesión (null si no hay sesión válida). */
export async function usuarioDeSesion(headers: Headers): Promise<Usuario | null> {
  const sesion = await getAuth().api.getSession({ headers });
  if (!sesion || !sesion.user.activo) return null;
  const id = Number(sesion.user.id);
  const rol = await fila<{ rol: string; permisos: string[] }>(
    `SELECT r.nombre AS rol,
            array(SELECT p.clave FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id WHERE rp.rol_id = r.id) AS permisos
       FROM roles r WHERE r.id = $1`,
    [sesion.user.rolId],
  );
  if (!rol) return null;
  return { id, nombre: sesion.user.name, correo: sesion.user.email, ...rol };
}

export const puede = (usuario: Usuario | null, permiso: string) => !!usuario?.permisos.includes(permiso);
