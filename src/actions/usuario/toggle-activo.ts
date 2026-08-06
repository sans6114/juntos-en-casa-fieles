"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function toggleUsuarioActivo(userId: string) {
  try {
    await requireAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return { ok: false as const, message: "Usuario no encontrado." }
    }
    if (user.rol === "ADMIN") {
      return { ok: false as const, message: "No se puede desactivar al administrador." }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { activo: !user.activo },
    })

    revalidatePath("/admin/usuarios")
    return { ok: true as const, activo: !user.activo }
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return { ok: false as const, message: "No se pudo actualizar el usuario." }
  }
}
