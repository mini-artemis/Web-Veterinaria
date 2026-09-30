// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  build: {
    // El CSS es pequeño: se incrusta en el HTML para no bloquear el primer pintado
    inlineStylesheets: 'always',
  },
});
