# Publicar en Vercel y configurar la seguridad

Corresponde a la rama del pizarrón **Bots → Ubicación geo (Mex) → Alto / Bajo / Medio**, ahora con
Vercel como hosting y Neon (Postgres) como base de datos.

## 1. Conectar el repositorio

En [vercel.com](https://vercel.com): **Add New → Project → Import** y elige este repositorio. Vercel
detecta Astro y pnpm solo; no hace falta cambiar nada en **Build & Output Settings**.

Cada push a `main` publica el sitio y cada PR tiene su propia vista previa con dirección propia.

## 2. Base de datos (Neon)

En el proyecto de Vercel: **Storage → Create Database → Neon (Postgres)**, plan gratis y región
cercana (por ejemplo `us-east`). Conéctala al proyecto: Vercel agrega sola la variable `DATABASE_URL`.

> Opcional: en la integración de Neon puedes activar que cada vista previa use su propia **rama** de la
> base, para que probar un PR no toque los datos reales.

## 3. Variables de entorno

**Settings → Environment Variables** (para *Production* y *Preview*):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La pone Neon (paso 2) |
| `BETTER_AUTH_SECRET` | Una llave larga al azar: `openssl rand -base64 32`. **Sin ella el login no funciona** |
| `TURNSTILE_SECRET_KEY` | Secret Key de Turnstile (paso 5) |
| `TURNSTILE_SITE_KEY` | Site Key de Turnstile (paso 5) |
| `PAISES_PERMITIDOS` | Opcional, por defecto `MX` (códigos separados por coma) |

Después de cambiar variables hay que volver a publicar: **Deployments → ⋯ → Redeploy**.

## 4. Crear las tablas y tu administrador

Desde tu computadora, con la `DATABASE_URL` de producción en tu `.env` (cópiala de Neon o de
**Settings → Environment Variables**). Repite `pnpm db:migrar` cada vez que agregues un archivo a
`migrations/`:

```bash
pnpm db:migrar                                     # crea las tablas en Neon
pnpm crear-admin "Tu Nombre" tu@correo.com         # te pide la contraseña
```

Luego regresa tu `.env` a tu base de desarrollo para no trabajar sobre los datos reales.

## 5. Turnstile (bloquear bots en el login)

Turnstile es el captcha de Cloudflare; funciona en cualquier hosting y solo necesita una cuenta
gratis de Cloudflare (no se hospeda nada ahí).

1. En [dash.cloudflare.com](https://dash.cloudflare.com) entra a **Turnstile → Add widget**. Ponle un
   nombre, agrega tu dominio de Vercel (por ejemplo `web-veterinaria.vercel.app`) y elige el modo **Managed**.
2. Copia la **Site Key** y la **Secret Key** en las variables del paso 3.

Mientras no tengas tus llaves se usan las de prueba (siempre aprueban): Site Key
`1x00000000000000000000AA` y Secret Key `1x0000000000000000000000000000000AA`. En desarrollo ya están
en `.env.example`.

## 6. Ubicación geográfica: solo México

El código ya rechaza con error 403 las visitas a `/login` y `/sistema` que vengan de fuera de México
(usa la cabecera `x-vercel-ip-country` que agrega Vercel y la variable `PAISES_PERMITIDOS`). Para
bloquearlas **antes** de que lleguen al servidor, agrega una regla en el firewall de Vercel:

**Firewall → Configure → New Rule**

- Nombre: `Sistema solo desde México`
- If **Request Path** *starts with* `/sistema` **or** **Request Path** *equals* `/login`
- And **Country** *does not equal* `Mexico`
- Then: **Deny**

Así las páginas públicas (Inicio, Nosotros) se siguen viendo desde cualquier país y solo el sistema
queda limitado a México.

## 7. Nivel de protección: Bajo / Medio / Alto

En **Firewall** decides qué tanto se reta a los visitantes antes de dejarlos pasar:

| Nivel | Qué activar | Cuándo usarlo |
|---|---|---|
| **Bajo** | Solo la regla de país (paso 6) | Casi no molesta a los usuarios |
| **Medio** (recomendado) | **Bot Protection** en modo *Challenge* | Equilibrio normal |
| **Alto** | **Attack Challenge Mode** (reta a todos los visitantes) | Solo durante un ataque |

Para subir la protección solo en el sistema, agrega otra regla con **Request Path** *starts with*
`/sistema` y acción **Challenge**.

## Resumen de capas de seguridad

| Capa | Dónde | Qué hace |
|---|---|---|
| Bot Protection | Firewall de Vercel | Frena bots conocidos |
| Regla de país | Firewall de Vercel + `src/middleware.ts` | Solo México entra al sistema |
| Attack Challenge Mode | Firewall de Vercel | Reta a todos durante un ataque |
| Turnstile | Login | Confirma que quien entra es una persona |
| Contraseñas PBKDF2 | Base de datos | Nunca se guardan en texto plano |
| Cookie `HttpOnly` + `Secure` + `SameSite` | Navegador | Protege la sesión de robo y de formularios falsos |
| Verificación de origen | Astro | Rechaza formularios enviados desde otros sitios (CSRF) |
| Roles y permisos | Servidor | Cada pantalla y acción revisa el permiso |
