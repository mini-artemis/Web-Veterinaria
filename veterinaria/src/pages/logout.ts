import type { APIRoute } from 'astro';
import { cerrarSesion } from '../lib/auth';

export const prerender = false;

// Se usa POST (botón dentro de un formulario) para que un enlace externo no pueda cerrar tu sesión
export const POST: APIRoute = async ({ cookies, redirect }) => {
  await cerrarSesion(cookies);
  return redirect('/login');
};
