# Puppy and Kitty — Sitio web

Sitio estático hecho con [Astro](https://astro.build). Las páginas se generan como HTML
en el build; solo se envía un poco de JavaScript para el menú, el carrusel y la historia de "Nosotros".

## Comandos

| Comando           | Acción                                          |
| ----------------- | ----------------------------------------------- |
| `npm install`     | Instala dependencias                            |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321`      |
| `npm run build`   | Genera el sitio en `dist/`                      |
| `npm run preview` | Sirve `dist/` para probar el build              |

## Estructura

- `src/layouts/Layout.astro` — `<head>`, navegación y footer compartidos
- `src/pages/index.astro` — Inicio (`/`)
- `src/pages/nosotros.astro` — Nosotros (`/nosotros`)
- `src/styles/global.css` — estilos
- `src/assets/` — imágenes originales; Astro las convierte a WebP en varios tamaños con `<Image>`
