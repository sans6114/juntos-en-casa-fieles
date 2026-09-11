"use server"

import { acreditarHoy } from "@/lib/asistencia/acreditar"
import { requireSession } from "@/lib/auth-guards"
import type { AsistenciaActionResult } from "@/interfaces/asistencia"

/**
 * Acredita a alguien en el día de HOY, sin QR. Es el camino de puerta: lo usa
 * el colaborador cuando la persona llega sin su código, o directamente sin
 * celular.
 *
 * Autorización deliberada: `requireSession()`, no `requireAdmin()`. El admin
 * supervisa y no acredita; si esto pidiera rol de admin, el día del evento no
 * habría nadie habilitado para usarlo.
 */
export async function marcarAsistenciaHoy(inscripcionId: string): Promise<AsistenciaActionResult> {
  await requireSession()

  if (!inscripcionId) return { ok: false, message: "Falta la inscripción." }

  try {
    const resultado = await acreditarHoy(inscripcionId)

    switch (resultado.estado) {
      case "acreditado":
        return { ok: true, nombre: resultado.nombre, horaLlegada: resultado.horaLlegada }

      case "ya-acreditado":
        return {
          ok: false,
          message: `${resultado.nombre} ya estaba acreditado hoy (${resultado.horaLlegada} hs).`,
          nombre: resultado.nombre,
          horaLlegada: resultado.horaLlegada,
        }

      case "no-encontrado":
        return { ok: false, message: "No encontramos esa inscripción." }

      case "fuera-de-fecha":
        return { ok: false, message: "Hoy no es un día oficial del evento." }

      case "sin-configurar":
        return { ok: false, message: "Configuración del evento incompleta. Avisá al administrador." }
    }
  } catch (error) {
    console.error("Error marcando asistencia:", error)
    return { ok: false, message: "No se pudo registrar la asistencia." }
  }
}
