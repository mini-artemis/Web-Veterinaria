import { env } from 'cloudflare:workers';

/** Pregunta a Cloudflare si el captcha (Turnstile) lo resolvió una persona y no un bot. */
export async function verificarTurnstile(respuesta: string | null, ip: string) {
  if (!respuesta) return false;
  const datos = new FormData();
  datos.append('secret', env.TURNSTILE_SECRET_KEY);
  datos.append('response', respuesta);
  datos.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: datos });
  const resultado = await res.json<{ success: boolean }>();
  return resultado.success;
}
