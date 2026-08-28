"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function toggleContenidoPublicado(id: string) {
  try {
    await requireAdmin()

    const contenido = await prisma.contenido.findUnique({ where: { id } })
    if (!contenido) {
      return { ok: false as const, message: "Contenido no encontrado." }
    }

    await prisma.contenido.update({
      where: { id },
      data: { publicado: !contenido.publicado },
    })

    revalidatePath("/admin/contenidos")
    revalidatePath("/contenidos")
    revalidatePath(`/contenidos/${contenido.slug}`)

    return { ok: true as const, publicado: !contenido.publicado }
  } catch (error) {
    console.error("Error actualizando contenido:", error)
    return { ok: false as const, message: "No se pudo actualizar el contenido." }
  }
}
