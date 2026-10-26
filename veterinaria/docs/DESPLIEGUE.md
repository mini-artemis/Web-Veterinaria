# Publicar en Cloudflare y configurar la seguridad

Corresponde a la rama del pizarrón **Cloudflare (bots) → Ubicación geo (Mex) → Alto / Bajo / Medio**.

## 1. Conectar el repositorio (Workers Builds)

En el panel de Cloudflare: **Workers & Pages → Create → Import a repository** y elige este repositorio.
Después, en **Settings → Build** del Worker `veterinaria`:

| Campo | Valor |
|---|---|
| Root directory | `veterinaria` |
| Build command | `pnpm build` |
| Deploy command | `pnpm run publicar` |

Cada push a `main` compila y publica el sitio. `pnpm run publicar` hace `wrangler deploy` (que crea la
base D1 `veterinaria-db` la primera vez) y luego aplica las migraciones de `migrations/` a esa base.

Cuando termine el primer deploy, crea tu administrador desde tu computadora:

```bash
pnpm wrangler login                                             # abre el navegador para entrar a tu cuenta
pnpm crear-admin "Tu Nombre" tu@correo.com "UnaContraseña" --remote
```

## 2. Turnstile (bloquear bots en el login)

1. En el panel de Cloudflare entra a **Turnstile → Add widget**. Ponle un nombre, agrega tu dominio
   (o `*.workers.dev`) y elige el modo **Managed**.
2. Copia la **Site Key** en `wrangler.jsonc`, en `vars.TURNSTILE_SITE_KEY`.
3. Guarda la **Secret Key** como secreto (no se escribe en ningún archivo), en el panel del Worker:
   **Settings → Variables and Secrets → Add → Secret**, con el nombre `TURNSTILE_SECRET_KEY`
   (o desde tu computadora con `pnpm wrangler secret put TURNSTILE_SECRET_KEY`).
   **Sin este secreto el login rechaza a todos.** Mientras no tengas tus llaves puedes usar la secreta de
   prueba `1x0000000000000000000000000000000AA` (siempre aprueba, junto con la Site Key de prueba).

En desarrollo se usan las llaves de prueba de Cloudflare, que siempre aprueban
(la secreta está en `.dev.vars`).

## 3. Publicar

Se publica solo con cada push a `main` (paso 1). Para publicar desde tu computadora sin hacer push:

```bash
pnpm run deploy
```

La dirección queda tipo `https://veterinaria.<tu-cuenta>.workers.dev`.

## 4. Ubicación geográfica: solo México

El código ya rechaza con error 403 las visitas a `/login` y `/sistema` que vengan de fuera de
México (variable `PAISES_PERMITIDOS` en `wrangler.jsonc`). Para bloquearlas **antes** de que lleguen
al servidor, se agrega una regla de firewall. Esto requiere un **dominio propio** en Cloudflare
(el plan gratuito sirve):

**Security → WAF → Custom rules → Create rule**

- Nombre: `Sistema solo desde México`
- Expresión (*Edit expression*):

  ```
  (http.request.uri.path eq "/login" or starts_with(http.request.uri.path, "/sistema"))
  and ip.src.country ne "MX"
  ```
- Acción: **Block**

Así las páginas públicas (Inicio, Nosotros) se siguen viendo desde cualquier país y solo el sistema
queda limitado a México.

## 5. Nivel de seguridad: Alto / Medio / Bajo

**Security → Settings → Security Level**. Decide qué tan sospechosa debe ser una IP (según su historial
de ataques) para que Cloudflare le muestre un reto antes de dejarla pasar:

| Nivel | A quién reta | Cuándo usarlo |
|---|---|---|
| **Bajo** | Solo a las IP más peligrosas | Casi no molesta a los usuarios |
| **Medio** (recomendado) | IP con amenazas moderadas o altas | Equilibrio normal |
| **Alto** | Cualquier IP con mal historial en los últimos 14 días | Cuando hay ataques |
| *I'm Under Attack* | A todos | Solo durante un ataque fuerte |

Recomendación: **Medio** en general y una regla que suba la protección solo en el sistema:
**Security → WAF → Custom rules**, con expresión `starts_with(http.request.uri.path, "/sistema")`
y acción **Managed Challenge**.

## 6. Bots en todo el sitio

**Security → Bots → Bot Fight Mode: On.** Bloquea bots conocidos en todo el dominio (es gratis).

## Resumen de capas de seguridad

| Capa | Dónde | Qué hace |
|---|---|---|
| Bot Fight Mode | Cloudflare | Frena bots conocidos |
| Regla WAF de país | Cloudflare | Solo México entra al sistema |
| Security Level | Cloudflare | Reta a IP con mal historial |
| Turnstile | Login | Confirma que quien entra es una persona |
| Contraseñas PBKDF2 | Base de datos | Nunca se guardan en texto plano |
| Cookie `HttpOnly` + `Secure` + `SameSite` | Navegador | Protege la sesión de robo y de formularios falsos |
| Verificación de origen | Astro | Rechaza formularios enviados desde otros sitios (CSRF) |
| Roles y permisos | Servidor | Cada pantalla y acción revisa el permiso |
