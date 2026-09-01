"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function aprobarCongregacion(id: string) {
  try {
    await requireAdmin()

    const congregacion = await prisma.congregacion.findUnique({ where: { id } })
    if (!congregacion) {
      return { ok: false as const, message: "Congregación no encontrada." }
    }

    await prisma.congregacion.update({
      where: { id },
      data: { estado: "APROBADA" },
    })

    revalidatePath("/admin/congregaciones")
    // `/inscripcion` es estatica (prerender de build, sin revalidate):
    // sin esta invalidacion el combobox publico sigue mostrando la lista
    // de congregaciones congelada en el ultimo deploy.
    revalidatePath("/inscripcion")
    return { ok: true as const }
  } catch (error) {
    console.error("Error aprobando congregación:", error)
    return { ok: false as const, message: "No se pudo aprobar la congregación." }
  }
}
