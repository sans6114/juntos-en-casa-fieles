"use server"

import { acreditarHoy } from "@/lib/asistencia/acreditar"
import { requireSession } from "@/lib/auth-guards"
import type { EscaneoResultado } from "@/interfaces/asistencia"

/**
 * Acreditación por escaneo de QR. Comparte el núcleo con el check manual de la
 * puerta (`marcarAsistenciaHoy`): misma escritura, misma resolución de día.
 * Acá solo cambian la redacción y la forma del resultado, porque esta pantalla
 * la mira el colaborador mientras tiene a la persona enfrente.
 */
export async function processQrScan(uuid: string): Promise<EscaneoResultado> {
  // Admin o colaborador. El trabajo de puerta lo hace el colaborador.
  await requireSession()

  if (!uuid) return { ok: false, message: "Código QR inválido" }

  try {
    const resultado = await acreditarHoy(uuid)

    switch (resultado.estado) {
      case "acreditado":
        return {
          ok: true,
          message: "Asistencia confirmada",
          persona: {
            nombre: resultado.nombre,
            horaLlegada: resultado.horaLlegada,
            congregacion: resultado.congregacion,
          },
        }

      case "ya-acreditado":
        // No es un error del operador: esta persona ya pasó. Viaja con los
        // mismos datos que el caso exitoso para que el colaborador vea de quién
        // se trata y lo resuelva en el momento.
        return {
          ok: false,
          yaAcreditado: true,
          message: `Ya había pasado a las ${resultado.horaLlegada} hs`,
          persona: {
            nombre: resultado.nombre,
            horaLlegada: resultado.horaLlegada,
            congregacion: resultado.congregacion,
          },
        }

      case "no-encontrado":
        return { ok: false, message: "Código QR inválido" }

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
