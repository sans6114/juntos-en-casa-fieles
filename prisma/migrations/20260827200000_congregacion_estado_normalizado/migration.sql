-- CreateEnum
CREATE TYPE "EstadoCongregacion" AS ENUM ('PENDIENTE', 'APROBADA');

-- AlterTable: agregar columnas nullable primero para poder backfillear antes
-- de aplicar NOT NULL + UNIQUE sobre filas existentes.
ALTER TABLE "Congregacion" ADD COLUMN "nombreNormalizado" TEXT;
ALTER TABLE "Congregacion" ADD COLUMN "estado" "EstadoCongregacion" NOT NULL DEFAULT 'PENDIENTE';

-- Backfill: normalizacion equivalente a src/lib/congregacion/normalizar.ts
-- via un mapa de acentos SQL (sin depender de la extension unaccent).
UPDATE "Congregacion" SET "nombreNormalizado" = btrim(regexp_replace(
  translate(lower("nombre"),
            'áàäâãéèëêíìïîóòöôõúùüûñç',
            'aaaaaeeeeiiiiooooouuuunc'),
  '\s+', ' ', 'g'));

-- Las 6 congregaciones existentes son las reales ya curadas en produccion.
UPDATE "Congregacion" SET "estado" = 'APROBADA';

-- AlterTable: ahora que todas las filas tienen valor, aplicar NOT NULL + UNIQUE.
ALTER TABLE "Congregacion" ALTER COLUMN "nombreNormalizado" SET NOT NULL;
CREATE UNIQUE INDEX "Congregacion_nombreNormalizado_key" ON "Congregacion"("nombreNormalizado");

-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN "sinCongregacion" BOOLEAN NOT NULL DEFAULT false;
