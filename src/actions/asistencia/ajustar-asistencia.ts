"use server"

import { campoAsistencia } from "@/lib/asistencia/dia-evento"
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
    console.error("Error ajustando asistencia:", error)
    return { ok: false as const, message: "No se pudo actualizar la asistencia." }
  }
}
