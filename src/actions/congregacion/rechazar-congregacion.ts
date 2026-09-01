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
    // apuntando a una fila borrada.
    //
    // NO escribe `sinCongregacion`. Rechazar significa "este nombre de
    // congregacion no es valido", no "esta persona no tiene congregacion": el
    // visitante si declaro una. `sinCongregacion` quedo reservado para la
    // declaracion explicita del visitante ("Soy nuevo" en el formulario, ver
    // `crear-inscripcion.ts`), que es su unico escritor.
    await prisma.$transaction([
      prisma.inscripcion.updateMany({
        where: { congregacionId: id },
        data: { congregacionId: null },
      }),
      prisma.congregacion.delete({ where: { id } }),
    ])

    revalidatePath("/admin/congregaciones")
    revalidatePath("/admin/inscripciones", "layout")
    // `/inscripcion` es estatica (prerender de build, sin revalidate):
    // sin esta invalidacion el combobox publico sigue mostrando la lista
    // de congregaciones congelada en el ultimo deploy.
    revalidatePath("/inscripcion")
    return { ok: true as const }
  } catch (error) {
    console.error("Error rechazando congregación:", error)
    return { ok: false as const, message: "No se pudo rechazar la congregación." }
  }
}
