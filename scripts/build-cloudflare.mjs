// Workers Builds instala las dependencias y luego corre `npx wrangler deploy` (o `npx wrangler preview`
// en los PR) sin compilar antes. Compilamos aquí para que wrangler encuentre dist/.
// Solo se ejecuta en Cloudflare (WORKERS_CI=1); en tu computadora `pnpm install` no compila nada.
import { execSync } from 'node:child_process';

if (process.env.WORKERS_CI) execSync('pnpm astro build', { stdio: 'inherit' });
