// @ts-check
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Las páginas públicas siguen siendo estáticas; las del sistema (login, inventario)
  // se generan en el servidor con `export const prerender = false`.
  adapter: vercel(),
  // Variables de entorno: en .env (local) y en Settings → Environment Variables de Vercel
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      BETTER_AUTH_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      PAISES_PERMITIDOS: envField.string({
        context: "server",
        access: "public",
        default: "MX",
      }),
    },
  },
  build: {
    // El CSS es pequeño: se incrusta en el HTML para no bloquear el primer pintado
    inlineStylesheets: "always",
  },
});
