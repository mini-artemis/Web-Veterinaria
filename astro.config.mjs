// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Las páginas públicas siguen siendo estáticas; las del sistema (login, inventario)
  // se generan en el servidor con `export const prerender = false`.
  adapter: cloudflare({
    // Optimiza las imágenes con sharp al compilar, como antes
    imageService: 'compile',
  }),
  // Las sesiones del sistema se guardan en D1 (src/lib/auth.ts); sin esto el adaptador agrega un KV
  // "SESSION" que no usamos y que rompe las vistas previas de Cloudflare (no tiene ID).
  session: false,
  build: {
    // El CSS es pequeño: se incrusta en el HTML para no bloquear el primer pintado
    inlineStylesheets: 'always',
  },
});
