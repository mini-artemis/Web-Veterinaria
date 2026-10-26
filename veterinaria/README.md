# Puppy and Kitty — Sitio web

Sitio hecho con [Astro](https://astro.build) y publicado en Cloudflare Workers. Las páginas públicas
(Inicio, Nosotros) se generan como HTML estático; el **sistema interno con login** (`/login`, `/sistema`)
se genera en el servidor y guarda sus datos en Cloudflare D1.

- Diseño de la base de datos: [`docs/DISENO-BD.md`](docs/DISENO-BD.md)
- Publicar y configurar la seguridad en Cloudflare: [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md)

## Primera vez (desarrollo local)

```bash
pnpm install
cp .dev.vars.example .dev.vars        # llaves de prueba de Turnstile
pnpm db:migrar                        # crea las tablas en la base local
pnpm crear-admin "Tu Nombre" tu@correo.com "UnaContraseña"
pnpm dev                              # http://localhost:4321  →  "Mi perfil"
```

## Comandos

| Comando | Acción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Genera el sitio en `dist/` |
| `pnpm preview` | Prueba el build en el mismo motor que Cloudflare |
| `pnpm db:migrar` / `pnpm db:migrar:remoto` | Aplica `migrations/` a la base local o a la de Cloudflare |
| `pnpm crear-admin "Nombre" correo "contraseña" [--remote]` | Crea un administrador |
| `pnpm deploy` | Compila y publica en Cloudflare |

## Estructura

- `src/layouts/Layout.astro` — `<head>`, navegación y footer compartidos
- `src/pages/index.astro` — Inicio (`/`)
- `src/pages/nosotros.astro` — Nosotros (`/nosotros`)
- `src/styles/global.css` — estilos
- `src/assets/` — imágenes originales; Astro las convierte a WebP en varios tamaños con `<Image>`
- `src/pages/login.astro`, `src/pages/logout.ts` — inicio y cierre de sesión (con Turnstile)
- `src/pages/sistema/` — Mi perfil, Inventario y Usuarios (requieren sesión)
- `src/middleware.ts` — revisa la sesión y el país en las rutas del sistema
- `src/lib/` — contraseñas y sesiones (`auth.ts`), Turnstile, utilidades de formularios
- `migrations/` — tablas y datos iniciales de la base de datos
