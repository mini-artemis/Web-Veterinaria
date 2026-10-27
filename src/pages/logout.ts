import type { APIRoute } from 'astro';
import { getAuth, redirigirConCookies } from '../lib/auth';

export const prerender = false;

// Se usa POST (botón dentro de un formulario) para que un enlace externo no pueda cerrar tu sesión
export const POST: APIRoute = async ({ request }) => {
  const { headers } = await getAuth().api.signOut({ headers: request.headers, returnHeaders: true });
  return redirigirConCookies(headers, '/login');
};
