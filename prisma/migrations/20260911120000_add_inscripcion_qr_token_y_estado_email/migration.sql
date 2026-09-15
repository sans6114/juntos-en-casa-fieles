-- Token privado para la URL publica `/mi-qr/<token>` y estado del envio del mail
-- con el QR.
--
-- Las columnas se agregan nullable primero para poder backfillear antes de
-- aplicar NOT NULL + UNIQUE sobre las filas existentes, mismo patron que
-- 20260827200000_congregacion_estado_normalizado.

-- 1. Columnas nuevas. `emailIntentos` lleva un default CONSTANTE (no volatil),
--    asi que PG11+ lo resuelve por metadata y no reescribe la tabla.
ALTER TABLE "Inscripcion" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "Inscripcion" ADD COLUMN "emailEnviadoAt" TIMESTAMP(3);
ALTER TABLE "Inscripcion" ADD COLUMN "emailError" TEXT;
ALTER TABLE "Inscripcion" ADD COLUMN "emailIntentos" INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill del token. `gen_random_uuid()` es parte del core desde PG13, asi
--    que no hace falta la extension pgcrypto (que en Neon esta disponible pero
--    NO instalada). Mismo recurso que ya usa 20260829230000 para generar ids.
--    Es VOLATILE, por lo que se evalua una vez por fila: 32 hex distintos.
UPDATE "Inscripcion"
SET "qrToken" = replace(gen_random_uuid()::text, '-', '')
WHERE "qrToken" IS NULL;

-- 3. El default lo pone la BASE, no la aplicacion. `vercel-build` corre
--    `prisma migrate deploy && next build`: entre esos dos pasos hay minutos con
--    esquema nuevo y codigo VIEJO sirviendo trafico, y ese codigo hace INSERT
--    sin mencionar "qrToken". Sin este default, cada inscripcion de esa ventana
--    violaria el NOT NULL de abajo y se perderia una persona real.
ALTER TABLE "Inscripcion"
  ALTER COLUMN "qrToken" SET DEFAULT replace(gen_random_uuid()::text, '-', '');

ALTER TABLE "Inscripcion" ALTER COLUMN "qrToken" SET NOT NULL;

-- Indice unico normal, NO `CONCURRENTLY`: Prisma envuelve cada archivo de
-- migracion en una transaccion, y `CREATE INDEX CONCURRENTLY` no puede correr
-- dentro de una.
CREATE UNIQUE INDEX "Inscripcion_qrToken_key" ON "Inscripcion"("qrToken");

-- 4. Normalizacion de emails a minusculas.
--    "Inscripcion"."email" es UNIQUE con indice sensible a mayusculas, y hay
--    filas cargadas con mayuscula inicial. Sin esto, esas personas escriben su
--    mail en minuscula en /mi-qr (que es lo que hace el teclado del celular por
--    defecto), no aparecen, siguen el camino de inscripcion nueva y chocan
--    contra el unique: quedan sin QR y sin salida, en la pagina que existe
--    justamente para darles una.
--    Verificado contra produccion antes de escribir esto: todas las filas
--    siguen siendo distintas despues de normalizar, asi que no hay colision.
UPDATE "Inscripcion"
SET "email" = lower(btrim("email"))
WHERE "email" <> lower(btrim("email"));

-- 5. Las filas que ya existen recibieron su QR hace semanas. Sin este backfill
--    quedarian con "emailEnviadoAt" NULL y el primer filtro de "no se envio" las
--    listaria a TODAS: un click en "reintentar todos" les mandaria un mail
--    duplicado a dias del evento.
--
--    Es un supuesto declarado, no una medicion: `sendQrEmail` se tragaba los
--    errores, asi que alguno de esos envios pudo fallar sin dejar registro. Se
--    asume "enviado" igual porque NULL es indistinguible de "fallo", la unica
--    respuesta automatica a "fallo" es reenviar, y reenviarle a todos es
--    exactamente el resultado que no se puede tener. Para quien de verdad no lo
--    recibio, la salida es /mi-qr.
UPDATE "Inscripcion"
SET "emailEnviadoAt" = "createdAt",
    "emailIntentos" = 1;
