# Puppy and Kitty — Sitio web

Sitio hecho con [Astro](https://astro.build) y publicado en [Vercel](https://vercel.com). Las páginas
públicas (Inicio, Nosotros) se generan como HTML estático; el **sistema interno con login** (`/login`,
`/sistema`) se genera en el servidor y guarda sus datos en Postgres ([Neon](https://neon.tech)).
El login (correo y contraseña) usa [Better Auth](https://www.better-auth.com).

- Diseño de la base de datos: [`docs/DISENO-BD.md`](docs/DISENO-BD.md)
- Publicar en Vercel y configurar la seguridad: [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md)

## Primera vez (desarrollo local)

```bash
pnpm install
cp .env.example .env                  # pon tu DATABASE_URL y un BETTER_AUTH_SECRET
pnpm db:migrar                        # crea las tablas en la base de DATABASE_URL
pnpm crear-admin "Tu Nombre" tu@correo.com    # te pide la contraseña
pnpm dev                              # http://localhost:4321  →  "Mi perfil"
```

Para `DATABASE_URL` puedes usar una rama de desarrollo de Neon (así no tocas los datos reales) o un
Postgres en tu computadora, por ejemplo con podman o docker:

```bash
podman run -d --name vet-pg -e POSTGRES_PASSWORD=vet -e POSTGRES_DB=veterinaria -p 55432:5432 docker.io/library/postgres:17
# DATABASE_URL=postgresql://postgres:vet@localhost:55432/veterinaria
```

## Comandos

| Comando | Acción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Genera el sitio para Vercel en `.vercel/output/` |
| `pnpm db:migrar` | Aplica los archivos nuevos de `migrations/` a la base de `DATABASE_URL` |
| `pnpm crear-admin "Nombre" correo` | Crea un administrador o le cambia la contraseña (la pide sin mostrarla) |

Vercel publica solo con cada push a `main` (y crea una vista previa por cada PR).

## Estructura

- `src/layouts/Layout.astro` — `<head>`, navegación y footer compartidos
- `src/pages/index.astro` — Inicio (`/`)
- `src/pages/nosotros.astro` — Nosotros (`/nosotros`)
- `src/styles/global.css` — estilos
- `src/assets/` — imágenes originales; Astro las convierte a WebP en varios tamaños con `<Image>`
- `src/pages/login.astro`, `src/pages/logout.ts` — inicio y cierre de sesión con Better Auth (y Turnstile)
- `src/pages/sistema/` — Mi perfil, Inventario y Usuarios (requieren sesión)
- `src/middleware.ts` — revisa la sesión y el país en las rutas del sistema
- `src/lib/` — configuración de Better Auth (`auth.ts`), conexión a Postgres (`db.ts`), Turnstile, utilidades de formularios
- `migrations/` — tablas y datos iniciales de la base de datos (`scripts/migrar.mjs` las aplica)
