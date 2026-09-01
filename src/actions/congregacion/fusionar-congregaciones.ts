"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { FusionarCongregacionesSchema, type FusionarCongregacionesDTO } from "@/interfaces/congregacion"

export async function fusionarCongregaciones(data: FusionarCongregacionesDTO) {
  try {
    await requireAdmin()

    const parsed = FusionarCongregacionesSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const { duplicadaId, canonicaId } = parsed.data

    if (duplicadaId === canonicaId) {
      return { ok: false as const, message: "Elegí dos congregaciones distintas para fusionar." }
    }

    const [duplicada, canonica] = await Promise.all([
      prisma.congregacion.findUnique({ where: { id: duplicadaId } }),
      prisma.congregacion.findUnique({ where: { id: canonicaId } }),
    ])

    if (!duplicada || !canonica) {
      return { ok: false as const, message: "Congregación no encontrada." }
    }

    // Reasignar primero, borrar despues: sin ventana de FK huerfano. No toca
    // `estado` de la sobreviviente ni `sinCongregacion` (eso solo lo escribe rechazar).
    await prisma.$transaction([
      prisma.inscripcion.updateMany({
        where: { congregacionId: duplicadaId },
        data: { congregacionId: canonicaId },
      }),
      prisma.congregacion.delete({ where: { id: duplicadaId } }),
    ])

    revalidatePath("/admin/congregaciones")
    revalidatePath("/admin/inscripciones", "layout")
    // `/inscripcion` es estatica (prerender de build, sin revalidate):
    // sin esta invalidacion el combobox publico sigue mostrando la lista
    // de congregaciones congelada en el ultimo deploy.
    revalidatePath("/inscripcion")
    return { ok: true as const }
  } catch (error) {
    console.error("Error fusionando congregaciones:", error)
    return { ok: false as const, message: "No se pudo fusionar las congregaciones." }
  }
}
