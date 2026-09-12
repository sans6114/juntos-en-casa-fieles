-- Marcador de "ya le mandamos el recordatorio".
--
-- El recordatorio previo al evento lo mandan varios colaboradores en paralelo,
-- uno por uno por WhatsApp, sobre la misma lista. Sin un marcador compartido,
-- cada uno no sabe por donde van los demas: se duplican mensajes, quedan
-- personas sin avisar, y nadie puede decir cuando terminaron.
--
-- Es un timestamp y no un booleano para poder responder "cuando" sin una tabla
-- aparte. `NULL` = todavia no. La misma forma que `emailEnviadoAt`.
ALTER TABLE "Inscripcion" ADD COLUMN "recordatorioEnviadoAt" TIMESTAMP(3);
