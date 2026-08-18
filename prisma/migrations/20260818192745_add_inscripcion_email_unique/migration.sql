/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Inscripcion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_email_key" ON "Inscripcion"("email");
