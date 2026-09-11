"use server"

import { acreditarHoy } from "@/lib/asistencia/acreditar"
import { requireSession } from "@/lib/auth-guards"

/**
 * Acreditación por escaneo de QR. Comparte el núcleo con el check manual de la
 * puerta (`marcarAsistenciaHoy`): misma escritura, misma resolución de día.
 * Acá solo cambia la redacción, porque quien escanea necesita saber si el
 * problema fue el código o la fecha.
 */
export async function processQrScan(uuid: string) {
  // Admin o colaborador. El trabajo de puerta lo hace el colaborador.
  await requireSession()

  if (!uuid) return { ok: false, message: "Error QR inválido" }

  try {
    const resultado = await acreditarHoy(uuid)

    switch (resultado.estado) {
      case "acreditado":
        return { ok: true, message: "Asistencia Confirmada" }

      case "ya-acreditado":
        return {
          ok: false,
          message: `QR ya escaneado, "${resultado.nombre}" pasó a las ${resultado.horaLlegada}hs`,
        }

      case "no-encontrado":
        return { ok: false, message: "Error QR inválido" }

      case "fuera-de-fecha":
        return {
          ok: false,
          message: "Hoy no es un día oficial del evento. No se permiten acreditaciones.",
        }

      case "sin-configurar":
        return { ok: false, message: "Configuración del evento incompleta. Avisá al administrador." }
    }
  } catch (error) {
    console.error("Error procesando escaneo de QR:", error)
    return { ok: false, message: "No se pudo registrar la asistencia." }
  }
}
