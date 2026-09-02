-- AlterTable
ALTER TABLE "Contenido" ADD COLUMN     "recursoId" TEXT;

-- CreateIndex
CREATE INDEX "Contenido_recursoId_idx" ON "Contenido"("recursoId");

-- AddForeignKey
ALTER TABLE "Contenido" ADD CONSTRAINT "Contenido_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "Contenido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
