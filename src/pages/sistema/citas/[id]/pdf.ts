import type { APIRoute } from 'astro';
import { puede } from '../../../../lib/auth';
import { generarPdfCita, type CitaDetallada } from '../../../../lib/citas';
import { fila } from '../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const usuario = locals.usuario;
  if (!usuario) return new Response('No autorizado.', { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response('Cita no válida.', { status: 400 });
  }

  const cita = await fila<CitaDetallada>(
    `SELECT c.id, c.usuario_id, u.nombre AS cliente_nombre, u.correo AS cliente_correo,
            c.mascota, c.especie, c.servicio, c.notas, c.fecha, c.hora, c.estado, c.creado_en
       FROM citas c
       JOIN usuarios u ON u.id = c.usuario_id
      WHERE c.id = $1`,
    [id],
  );

  if (!cita) {
    return new Response('Cita no encontrada.', { status: 404 });
  }

  if (cita.usuario_id !== usuario.id && !puede(usuario, 'citas.administrar')) {
    return new Response('No tienes permiso para descargar esta cita.', { status: 403 });
  }

  const pdfBytes = generarPdfCita(cita);
  const folio = String(cita.id).padStart(4, '0');

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cita-puppy-and-kitty-${folio}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
};
