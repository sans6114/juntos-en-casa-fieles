"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

/**
 * Marca o desmarca que a esta persona ya se le mandó el recordatorio previo al
 * evento.
 *
 * Lo escriben los colaboradores a mano, mientras van mandando uno por uno por
 * WhatsApp. Es el único dato que les permite trabajar la misma lista en paralelo
 * sin repartírsela: quien ya está marcado desaparece del filtro para todos.
 *
 * Se puede desmarcar a propósito: con cuatro personas tocando la misma grilla,
 * alguien va a marcar de más, y sin vuelta atrás esa persona se queda sin aviso.
 */
export async function marcarRecordatorio(inscripcionId: string, enviado: boolean) {
  await requireSession()

  if (!inscripcionId) return { ok: false as const, message: "Falta la inscripción." }

  try {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      select: { id: true, nombre: true },
    })

    if (!inscripcion) return { ok: false as const, message: "No encontramos esa inscripción." }

    await prisma.inscripcion.update({
      where: { id: inscripcionId },
      data: { recordatorioEnviadoAt: enviado ? new Date() : null },
    })

    revalidatePath("/admin/inscripciones", "layout")

    return {
      ok: true as const,
      message: enviado
        ? `${inscripcion.nombre}: recordatorio marcado.`
        : `${inscripcion.nombre}: recordatorio desmarcado.`,
    }
  } catch (error) {
    console.error("Error marcando recordatorio:", error)
    return { ok: false as const, message: "No se pudo actualizar el recordatorio." }
  }
}
