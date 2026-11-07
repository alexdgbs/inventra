# Inventra

Inventra es un marketplace de servicios profesionales: un catálogo donde se
exploran servicios por categoría, se busca por texto, se ven los detalles y
tarifas de cada servicio y se puede enviar una solicitud de contacto. El
administrador gestiona servicios, categorías y solicitudes desde un panel.

- **Demo en vivo:** https://inventra-seven-xi.vercel.app
- **Stack:** React 19 + Vite (web), Express 5 + Prisma 6 + PostgreSQL (API)

## Estructura del monorepo

```text
apps/
  web/   # React 19 + Vite + React Router. Se despliega en Vercel.
  api/   # Express 5 + Prisma + PostgreSQL. Se despliega en Render.
compose.yaml  # Solo para la base de datos local (PostgreSQL en Docker).
```

## Desarrollo local

Requisitos: Node.js 20+ y Docker (para la base de datos local).

```bash
npm ci
docker compose up -d
```

Configura las variables de entorno (ver `.env.example` en cada app):

- `apps/api/.env`: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
  `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
- `apps/web/.env`: `VITE_API_URL` y `VITE_USD_MXN_RATE`.

Después:

```bash
npm run db:migrate   # crea las tablas en la base de datos local
npm run db:seed      # crea el usuario administrador y el catálogo de ejemplo
npm run dev          # web en http://localhost:5173 y API en http://localhost:4000
```

El seed exige `ADMIN_PASSWORD` para crear el administrador inicial (si el
usuario ya existe, no se vuelve a crear).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Web y API a la vez. |
| `npm run dev:web` / `npm run dev:api` | Solo una parte. |
| `npm run build` | Compila la web. |
| `npm run lint` | ESLint en web y API. |
| `npm run test` | Tests de web y API (Vitest). |
| `npm run db:generate` | Regenera el cliente de Prisma. |
| `npm run db:migrate` | Migraciones en desarrollo. |
| `npm run db:deploy` | Migraciones en producción. |
| `npm run db:seed` | Catálogo inicial de ejemplo. |
| `npm run start` | Arranca la API. |

## Despliegue

- **Web:** Vercel (`apps/web`). Su `vercel.json` redirige `/api/*` a la API
  de Render y el resto a `index.html` (SPA).
- **API:** Render (`apps/api`), con PostgreSQL gestionado.

### Limitación conocida: cold start de Render

La API está en el plan gratuito de Render y se duerme tras un rato sin
uso: la primera visita después de un periodo de inactividad puede tardar
varios segundos en responder. Por eso el cliente web da **60 segundos**
de margen a `GET /api/items`, con **un reintento automático** si la
petición falla sin respuesta o con un error 502/503/504. El resto de las
peticiones mantienen el límite de 15 segundos.

## Catálogo de demostración

Los servicios del catálogo son **datos de ejemplo**: servicios genéricos
(por ejemplo, "Diseño de identidad" o "Tienda en línea"), sin clientes,
reseñas ni proveedores reales. El seed (`apps/api/prisma/seed.js`) crea o
actualiza cada servicio por nombre, pero **no borra los servicios antiguos
de la base de datos**: si un servicio deja de estar en el seed, sigue en
la base desplegada hasta borrarlo a mano desde el panel.

### Actualizar el catálogo en producción (seed)

El seed de la base local no toca la base de Render. Para que los servicios
nuevos del seed aparezcan en la página en vivo hay que lanzar el workflow
**Seed catálogo** a mano. Primero, una sola vez, hay que guardar estos
secretos en el repo (**Settings → Secrets and variables → Actions →
New repository secret**):

| Secreto | Valor |
| --- | --- |
| `DATABASE_URL` | La cadena de conexión de PostgreSQL, copiada desde el panel de Render (el servicio de base de datos de la API). |
| `ADMIN_USERNAME` | El mismo usuario administrador que usa la API en Render. |
| `ADMIN_PASSWORD` | La misma contraseña de administrador que usa la API en Render. |

Después, cada vez que cambie el seed:

1. Entra a **Actions → Seed catálogo → Run workflow** y elige la rama
   `main`.
2. Espera a que termine (1-2 minutos) y revisa
   `https://inventra-seven-xi.vercel.app/api/items`: ahí deben aparecer
   los 14 servicios.

Nunca escribas estos valores en el código ni en un commit: solo viven
como secretos de GitHub Actions.

## Conversión de moneda

El catálogo muestra los precios en MXN o USD. La conversión a USD usa la
tasa configurable `VITE_USD_MXN_RATE` (por defecto `17`) y se presenta en
la web como una conversión estimada: la tasa no se actualiza sola y puede
quedar desfasada.
