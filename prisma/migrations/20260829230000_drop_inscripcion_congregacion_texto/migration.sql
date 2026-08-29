-- Elimina `Inscripcion.congregacionTexto`. La FK `congregacionId` pasa a ser la
-- UNICA representacion de a que congregacion pertenece una inscripcion.
--
-- Por que la FK y no el texto: `Congregacion.estado` (APROBADA/PENDIENTE) vive
-- en la tabla, no en la inscripcion. Sin FK, el KPI "Congregaciones activas" se
-- queda sin fuente y el chart parte una misma iglesia en una barra por cada
-- forma de tipearla. Con FK, renombrar o fusionar toca UNA fila y todas las
-- inscripciones la siguen.
--
-- La normalizacion replica `normalizarNombreCongregacion`
-- (src/lib/congregacion/normalizar.ts) con el mismo mapa de acentos que uso la
-- migracion 20260827200000, sin depender de la extension `unaccent`. La
-- expresion va escrita dos veces a proposito: la migracion corre una sola vez y
-- no deja objetos temporales atras.

-- 1. Alta de las congregaciones que hoy solo existen como texto libre legacy.
--    Entran como PENDIENTE: son nombres crudos de visitante, sin curar.
INSERT INTO "Congregacion" ("id", "nombre", "nombreNormalizado", "estado", "createdAt", "updatedAt")
SELECT DISTINCT ON (legacy.norm)
  'cg_' || replace(gen_random_uuid()::text, '-', ''),
  legacy.nombre,
  legacy.norm,
  'PENDIENTE'::"EstadoCongregacion",
  NOW(),
  NOW()
FROM (
  SELECT
    -- Nombre visible: se colapsan espacios de sobra pero se respetan
    -- mayusculas y acentos, que son justamente lo que el admin quiere ver.
    btrim(regexp_replace("congregacionTexto", '\s+', ' ', 'g')) AS nombre,
    btrim(regexp_replace(
      translate(lower("congregacionTexto"),
                'áàäâãéèëêíìïîóòöôõúùüûñç',
                'aaaaaeeeeiiiiooooouuuunc'),
      '\s+', ' ', 'g')) AS norm,
    count(*) AS freq
  FROM "Inscripcion"
  WHERE "congregacionId" IS NULL
    AND "congregacionTexto" IS NOT NULL
    AND btrim("congregacionTexto") <> ''
  GROUP BY 1, 2
) AS legacy
WHERE legacy.norm <> ''
-- Entre varias formas de escribir la misma iglesia gana la mas usada; el
-- desempate alfabetico solo existe para que la migracion sea determinista.
ORDER BY legacy.norm, legacy.freq DESC, legacy.nombre
ON CONFLICT ("nombreNormalizado") DO NOTHING;

-- 2. Enganche por FK. El join por `nombreNormalizado` cubre tanto las filas
--    recien creadas como las congregaciones que ya existian y colisionaron
--    en el paso anterior (ahi el ON CONFLICT no inserto nada, a proposito).
UPDATE "Inscripcion" AS i
SET "congregacionId" = c."id"
FROM "Congregacion" AS c
WHERE i."congregacionId" IS NULL
  AND i."congregacionTexto" IS NOT NULL
  AND c."nombreNormalizado" = btrim(regexp_replace(
    translate(lower(i."congregacionTexto"),
              'áàäâãéèëêíìïîóòöôõúùüûñç',
              'aaaaaeeeeiiiiooooouuuunc'),
    '\s+', ' ', 'g'));

-- 3. En el formulario viejo la congregacion era UN campo opcional, y dejarlo
--    vacio era la unica forma de decir "no tengo". Ese significado se persiste
--    como dato explicito ahora, porque al borrar la columna deja de ser
--    reconstruible. Desde el formulario nuevo lo escribe el checkbox "Soy nuevo".
UPDATE "Inscripcion"
SET "sinCongregacion" = true
WHERE "congregacionId" IS NULL
  AND ("congregacionTexto" IS NULL OR btrim("congregacionTexto") = '')
  AND "sinCongregacion" = false;

-- 4. La columna ya no guarda nada que no este en la FK.
ALTER TABLE "Inscripcion" DROP COLUMN "congregacionTexto";
