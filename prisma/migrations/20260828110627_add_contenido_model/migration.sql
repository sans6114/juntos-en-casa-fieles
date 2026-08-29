-- CreateEnum
CREATE TYPE "TipoContenido" AS ENUM ('PREDICA', 'VIDEO', 'RECURSOS');

-- CreateEnum
CREATE TYPE "CampoThumb" AS ENUM ('CAMPO_PAPEL', 'CAMPO_TINTA', 'CAMPO_FUEGO');

-- CreateTable
CREATE TABLE "Contenido" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoContenido" NOT NULL,
    "edicion" INTEGER NOT NULL,
    "sesion" TEXT,
    "orador" TEXT,
    "youtubeId" TEXT,
    "duracion" TEXT,
    "placasUrl" TEXT,
    "placasCount" INTEGER,
    "campo" "CampoThumb" NOT NULL,
    "imagenSrc" TEXT,
    "imagenCover" BOOLEAN NOT NULL DEFAULT false,
    "imagenAtenuada" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contenido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contenido_slug_key" ON "Contenido"("slug");
