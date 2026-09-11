-- El email deja de ser obligatorio.
--
-- Motivo de negocio: cuando el colaborador da de alta a alguien en la puerta, la
-- persona ya esta entrando y se la acredita en el acto. El mail no se usa para
-- nada en ese flujo —no se envia QR— y pedirlo obliga a inventar una direccion
-- con gente esperando, que es peor que no tenerlo.
--
-- El formulario publico lo SIGUE exigiendo: ahi el mail es el unico canal por el
-- que llega el QR. La obligatoriedad se sostiene en `CrearInscripcionSchema`, no
-- en la base.
ALTER TABLE "Inscripcion" ALTER COLUMN "email" DROP NOT NULL;

-- El indice unico se mantiene y sigue siendo correcto: Postgres trata cada NULL
-- como distinto de los demas (no se usa NULLS NOT DISTINCT), asi que pueden
-- convivir muchas altas de puerta sin email sin chocar entre si, mientras dos
-- inscripciones con el MISMO mail siguen siendo imposibles.
