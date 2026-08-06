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

## Variables de entorno

Es necesario configurar un archivo `.env` en la raíz del proyecto (basado en el archivo `.env.example`). Las variables requeridas son:

| Variable | Descripción | Valor local / por defecto |
|---|---|---|
| `DATABASE_URL` | URL de conexión a la base de datos PostgreSQL |
| `ADMIN_EMAIL` | Correo electrónico del administrador del panel |
| `ADMIN_PASSWORD` | Contraseña del administrador del panel |
| `SESSION_SECRET` | Clave utilizada para firmar criptográficamente la cookie del admin (genera automaticamente un hash no escribir nada en el caso de no tener una) 


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
