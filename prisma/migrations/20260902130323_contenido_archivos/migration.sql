-- El par `placasUrl`/`placasCount` solo admitia un PDF unico por contenido.
-- Pasa a una tabla propia para poder guardar N archivos, distinguir PDF de
-- imagen sin parsear la URL, y ordenarlos.
--
-- ORDEN IMPORTANTE: la tabla se crea y se backfillea ANTES de borrar las
-- columnas viejas. El SQL que genera `prisma migrate dev` pone el DROP COLUMN
-- primero, lo que destruiria la data existente. Mismo patron de pasos
-- numerados que `20260829230000_drop_inscripcion_congregacion_texto`.

-- 1. Nueva tabla, su indice y su FK.
CREATE TABLE "ContenidoArchivo" (
    "id" TEXT NOT NULL,
    "contenidoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "paginas" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContenidoArchivo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContenidoArchivo_contenidoId_idx" ON "ContenidoArchivo"("contenidoId");

ALTER TABLE "ContenidoArchivo" ADD CONSTRAINT "ContenidoArchivo_contenidoId_fkey" FOREIGN KEY ("contenidoId") REFERENCES "Contenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Backfill: cada `placasUrl` existente se convierte en su unica fila, que
--    siempre fue un PDF (`allowedContentTypes: ["application/pdf"]` era el
--    unico valor que aceptaba la ruta de upload). `placasCount` era el conteo
--    de paginas de ese PDF, asi que migra tal cual a `paginas`.
--
--    `gen_random_uuid()` y no `cuid()`: cuid vive en el cliente de Prisma, no
--    en Postgres. Es nativo desde PG13, sin extensiones.
INSERT INTO "ContenidoArchivo" ("id", "contenidoId", "url", "mime", "orden", "paginas", "createdAt")
SELECT
    gen_random_uuid()::text,
    "id",
    "placasUrl",
    'application/pdf',
    0,
    "placasCount",
    CURRENT_TIMESTAMP
FROM "Contenido"
WHERE "placasUrl" IS NOT NULL;

-- 3. Ahora que la data vive en la tabla nueva, se van las columnas viejas.
ALTER TABLE "Contenido" DROP COLUMN "placasUrl",
DROP COLUMN "placasCount";
