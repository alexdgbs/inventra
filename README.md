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

Crea a mano los archivos de variables de entorno (no hay archivo de
ejemplo en el repo):

`apps/api/.env`:

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL (local: la de `docker compose up -d`). |
| `JWT_SECRET` | Secreto para firmar las sesiones (mínimo 32 caracteres, genera uno propio). |
| `CORS_ORIGIN` | Orígenes permitidos para el front, separados por comas (`http://localhost:5173`). |
| `PORT` | Puerto de la API (opcional, por defecto `4000`). |
| `ADMIN_USERNAME` | Usuario administrador inicial que crea el seed. |
| `ADMIN_PASSWORD` | Contraseña de ese administrador (el seed la exige para crearlo). |

`apps/web/.env`:

| Variable | Para qué |
| --- | --- |
| `VITE_API_URL` | URL base de la API en desarrollo (`http://localhost:4000`; en producción la web usa el proxy `/api` de Vercel). |
| `VITE_USD_MXN_RATE` | Tasa estimada de conversión MXN por USD (por defecto `17`). |

Nunca subas el `.env` real: contiene secretos.

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
  de Render y el resto a `index.html` (SPA). Ojo: la dirección de la API
  de Render está escrita a mano en `apps/web/vercel.json`
  (`https://inventra-hv01.onrender.com`). Vercel no acepta variables de
  entorno ahí, así que si el servicio de Render se renombra o se recrea
  hay que actualizar ese archivo a mano y redesplegar.
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
**Seed catálogo** a mano. Primero, una sola vez:

1. Crea el archivo `.github/workflows/seed.yml` en el repo con este
   contenido (hay que crearlo a mano: la app de GitHub no puede crear
   archivos en `.github/workflows`):

```yaml
name: Seed catálogo

# Solo se lanza a mano: actualiza el catálogo de la base de datos de
# producción (Render) con el seed del repo (14 servicios de ejemplo).
# No corre en cada push: el seed escribe en la base real.
on:
  workflow_dispatch:

jobs:
  seed:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run db:generate -w @inventra/api
      - run: npm run db:seed -w @inventra/api
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

2. Guarda estos secretos en el repo (**Settings → Secrets and variables →
   Actions → New repository secret**):

| Secreto | Valor |
| --- | --- |
| `DATABASE_URL` | La cadena de conexión de PostgreSQL, copiada desde el panel de Render (el servicio de base de datos de la API). |
| `ADMIN_USERNAME` | El mismo usuario administrador que usa la API en Render. |
| `ADMIN_PASSWORD` | La misma contraseña de administrador que usa la API en Render. |

3. Entra a **Actions → Seed catálogo → Run workflow** y elige la rama
   `main`. Espera a que termine (1-2 minutos) y revisa
   `https://inventra-seven-xi.vercel.app/api/items`: ahí deben aparecer
   los 14 servicios.

Nunca escribas estos valores en el código ni en un commit: solo viven
como secretos de GitHub Actions.

## Conversión de moneda

El catálogo muestra los precios en MXN o USD. La conversión a USD usa la
tasa configurable `VITE_USD_MXN_RATE` (por defecto `17`) y se presenta en
la web como una conversión estimada: la tasa no se actualiza sola y puede
quedar desfasada.
