import { defineMiddleware } from 'astro:middleware';

const esPrivada = (ruta: string) => ruta === '/login' || ruta === '/logout' || ruta.startsWith('/sistema');

export const onRequest = defineMiddleware(async (context, next) => {
  // Las páginas públicas se generan al compilar: no hay usuario ni base de datos
  if (context.isPrerendered || !esPrivada(context.url.pathname)) return next();

  // Se cargan aquí y no arriba: al compilar las páginas públicas no hay base de datos ni llaves,
  // y astro:env revisa todas las variables secretas en cuanto se importa
  const [{ PAISES_PERMITIDOS }, { usuarioDeSesion }] = await Promise.all([import('astro:env/server'), import('./lib/auth')]);

  // Ubicación geográfica: el sistema solo se abre desde los países permitidos (México).
  // La regla principal está en el firewall de Vercel (docs/DESPLIEGUE.md); esto es un segundo candado.
  // En desarrollo no se aplica porque la ubicación local no es real.
  if (!import.meta.env.DEV) {
    const pais = context.request.headers.get('x-vercel-ip-country'); // la pone Vercel en cada visita
    const permitidos = PAISES_PERMITIDOS.split(',').map((p) => p.trim());
    if (pais && !permitidos.includes(pais)) {
      return new Response('El sistema solo está disponible desde México.', { status: 403 });
    }
  }

  context.locals.usuario = await usuarioDeSesion(context.request.headers);

  // Todo lo que está en /sistema requiere haber iniciado sesión
  if (context.url.pathname.startsWith('/sistema') && !context.locals.usuario) {
    return context.redirect('/login');
  }

  const respuesta = await next();
  // Las páginas con datos privados no se guardan en caché
  respuesta.headers.set('Cache-Control', 'no-store');
  return respuesta;
});
