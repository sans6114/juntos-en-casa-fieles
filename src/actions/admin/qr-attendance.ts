"use server"

import {
  campoAsistencia,
  diaEventoDeHoy,
  FechasEventoNoConfiguradas,
} from "@/lib/asistencia/dia-evento"
import { requireSession } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

export async function processQrScan(uuid: string) {
  // 1. Verificar sesión (admin o colaborador)
  await requireSession()

  if (!uuid) return { ok: false, message: "Error QR inválido" }

  // 2. Buscar inscripción
  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: uuid }
  })

  if (!inscripcion) {
    return { ok: false, message: "Error QR inválido" }
  }

  // 3. Resolver qué día de evento es hoy (misma lógica que el check manual)
  const now = new Date()

  let dia
  try {
    dia = diaEventoDeHoy(now)
  } catch (error) {
    // Mensaje distinto al de "hoy no es día de evento" a propósito: quien está
    // en la puerta tiene que poder distinguir un problema de configuración de
    // un escaneo fuera de fecha, porque piden acciones opuestas.
    if (error instanceof FechasEventoNoConfiguradas) {
      console.error(error)
      return { ok: false, message: "Configuración del evento incompleta. Avisá al administrador." }
    }
    throw error
  }

  if (!dia) {
    return { ok: false, message: "Hoy no es un día oficial del evento. No se permiten acreditaciones." }
  }

  const asistenciaField = campoAsistencia(dia)

  // 4. Verificar si ya asistió
  const asistenciaActual = inscripcion[asistenciaField]
  if (asistenciaActual) {
    const timeFormatted = asistenciaActual.toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit"
    })
    return { 
      ok: false, 
      message: `QR ya escaneado, "${inscripcion.nombre}" paso a las ${timeFormatted}hs` 
    }
  }

  // 5. Registrar asistencia
  await prisma.inscripcion.update({
    where: { id: uuid },
    data: { [asistenciaField]: now }
  })

  return { ok: true, message: "Asistencia Confirmada" }
}
