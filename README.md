# Juntos en Casa Fieles

Aplicación web para la gestión de inscripciones del evento Juntos en casa, con panel de administración y gestion de datos.

## Requisitos

- Node.js 20+
- Docker y Docker Compose

## Configuración

```bash
# 1. Clonar e instalar dependencias
git clone <url-del-repo>
cd juntos-en-casa-fieles
npm install

# 2. Variables de entorno
cp .env.example .env

# 3. Base de datos
docker compose up -d
npx prisma migrate dev
npx prisma generate

# 4. Servidor de desarrollo
npm run dev
```

La app corre en [http://localhost:3000](http://localhost:3000). El panel de admin está en `/admin`.

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npx prisma studio` | Explorar la base de datos |

## Estructura

```
src/app/(external)/   → Páginas públicas (landing page)
src/app/(internal)/   → Panel de administración
prisma/               → Schema y migraciones
```
