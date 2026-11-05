import type { APIRoute } from 'astro';
import { consulta } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const usuario = locals.usuario;
  if (!usuario) return redirect('/login', 303);

  const datos = await request.formData();
  const acepto = datos.get('acepto') === '1';
  const origen = String(datos.get('origen') ?? '/sistema');
  const destino = origen.startsWith('/sistema') ? origen : '/sistema';

  if (acepto) {
    await consulta(
      `UPDATE usuarios
          SET aviso_privacidad_aceptado = true,
              aviso_privacidad_fecha = now(),
              actualizado_en = now()
        WHERE id = $1`,
      [usuario.id],
    );
  }

  return redirect(destino, 303);
};
