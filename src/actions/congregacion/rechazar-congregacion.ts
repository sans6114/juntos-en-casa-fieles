"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function rechazarCongregacion(id: string) {
  try {
    await requireAdmin()

    const congregacion = await prisma.congregacion.findUnique({ where: { id } })
    if (!congregacion) {
      return { ok: false as const, message: "Congregación no encontrada." }
    }

    // FK limpio antes del delete: garantiza que ninguna inscripcion quede
    // apuntando a una fila borrada, y que `sinCongregacion` caiga exactamente
    // sobre el set de inscripciones que apuntaban a esta congregacion.
    await prisma.$transaction([
      prisma.inscripcion.updateMany({
        where: { congregacionId: id },
        data: { congregacionId: null, sinCongregacion: true },
      }),
      prisma.congregacion.delete({ where: { id } }),
    ])

    revalidatePath("/admin/congregaciones")
    revalidatePath("/admin/inscripciones", "layout")
    return { ok: true as const }
  } catch (error) {
    console.error("Error rechazando congregación:", error)
    return { ok: false as const, message: "No se pudo rechazar la congregación." }
  }
}
