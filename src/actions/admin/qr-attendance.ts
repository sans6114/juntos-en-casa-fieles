"use server"

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

  // 3. Obtener fecha actual en Argentina
  const now = new Date()
  const argDateString = now.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }) 
  // Formato: DD/MM/YYYY
  const [day, month, year] = argDateString.split("/")
  const todayStr = `${year}-${month}-${day}` // YYYY-MM-DD

  const eventDay1 = process.env.EVENT_DAY_1 || "2026-09-18"
  const eventDay2 = process.env.EVENT_DAY_2 || "2026-09-19"
  const eventDay3 = process.env.EVENT_DAY_3 || "2026-09-20"

  let asistenciaField: "asistenciaDia1" | "asistenciaDia2" | "asistenciaDia3" | null = null

  if (todayStr === eventDay1) asistenciaField = "asistenciaDia1"
  else if (todayStr === eventDay2) asistenciaField = "asistenciaDia2"
  else if (todayStr === eventDay3) asistenciaField = "asistenciaDia3"

  if (!asistenciaField) {
    return { ok: false, message: "Hoy no es un día oficial del evento. No se permiten acreditaciones. " }
  }

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
