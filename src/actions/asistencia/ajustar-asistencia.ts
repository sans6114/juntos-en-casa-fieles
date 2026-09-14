"use server"

import {
  campoAsistencia,
  diaYaOcurrio,
  FechasEventoNoConfiguradas,
} from "@/lib/asistencia/dia-evento"
import { revalidarVistasDeAsistencia } from "@/lib/asistencia/revalidar-vistas"
import { requireSession } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import {
  AjustarAsistenciaSchema,
  type AjustarAsistenciaDTO,
} from "@/interfaces/asistencia"

/**
 * Corrige la acreditación de un día puntual: marca o DESMARCA. Existe para
 * arreglar un error de puerta o para cargar a alguien al día siguiente.
 *
 * Separada de `marcarAsistenciaHoy` a propósito, no por permisos —las dos son
 * `requireSession()`— sino por semántica: el camino rápido de puerta no puede
 * borrar una asistencia ni siquiera por accidente, y acá desmarcar es el punto.
 *
 * Por la misma razón la escritura es incondicional: `marcarAsistenciaHoy` usa
 * un `updateMany` condicionado a `campo: null` para ganar la carrera entre dos
 * personas acreditando a la vez; acá eso impediría justamente lo que se pide.
 */
export async function ajustarAsistencia(data: AjustarAsistenciaDTO) {
  await requireSession()

  try {
    const parsed = AjustarAsistenciaSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: "Datos inválidos." }
    }

    const { inscripcionId, dia, presente } = parsed.data

    // Esta action comparte la fuente de fechas con el escáner, pero hasta acá
    // no la CONSULTABA: escribía el día que le pidieran, incluido uno que
    // todavía no había llegado. Marcar presente un día futuro no es corregir
    // nada —no ocurrió nada que corregir—, infla el contador de asistencias y,
    // cuando la persona aparece de verdad y escanea, el escáner le contesta "ya
    // acreditado" y frena la fila.
    //
    // Desmarcar se permite SIEMPRE, incluso en un día futuro: es la única
    // salida si una fila quedó mal cargada, y bloquearla dejaría el dato malo
    // sin forma de arreglarse.
    if (presente && !diaYaOcurrio(dia)) {
      return {
        ok: false as const,
        message: `El día ${dia} todavía no empezó: solo se puede acreditar un día en curso o ya pasado.`,
      }
    }

    const campo = campoAsistencia(dia)

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      select: { id: true },
    })

    if (!inscripcion) {
      return { ok: false as const, message: "No encontramos esa inscripción." }
    }

    await prisma.inscripcion.update({
      where: { id: inscripcionId },
      data: { [campo]: presente ? new Date() : null },
    })

    revalidarVistasDeAsistencia()

    return { ok: true as const }
  } catch (error) {
    if (error instanceof FechasEventoNoConfiguradas) {
      // Mismo criterio que el escáner: que falte una fecha se dice, no se
      // disfraza de error genérico.
      console.error(error)
      return {
        ok: false as const,
        message: "Faltan las fechas del evento en la configuración. Avisale al administrador.",
      }
    }

    console.error("Error ajustando asistencia:", error)
    return { ok: false as const, message: "No se pudo actualizar la asistencia." }
  }
}
