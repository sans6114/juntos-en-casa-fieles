"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { normalizarNombreCongregacion } from "@/lib/congregacion/normalizar"
import { RenombrarCongregacionSchema, type RenombrarCongregacionDTO } from "@/interfaces/congregacion"

import { Prisma } from "../../../generated/client"

const MENSAJE_COLISION = "Ya existe una congregación con ese nombre. Usá Fusionar."

export async function renombrarCongregacion(data: RenombrarCongregacionDTO) {
  try {
    await requireAdmin()

    const parsed = RenombrarCongregacionSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const congregacion = await prisma.congregacion.findUnique({ where: { id: parsed.data.id } })
    if (!congregacion) {
      return { ok: false as const, message: "Congregación no encontrada." }
    }

    const nombreNormalizado = normalizarNombreCongregacion(parsed.data.nombre)

    // Clave sin cambios (fix cosmetico de mayusculas/acentos): actualiza solo
    // `nombre`, nunca es una colision consigo misma.
    if (nombreNormalizado !== congregacion.nombreNormalizado) {
      const colision = await prisma.congregacion.findUnique({ where: { nombreNormalizado } })
      if (colision && colision.id !== congregacion.id) {
        return { ok: false as const, message: MENSAJE_COLISION }
      }
    }

    try {
      await prisma.congregacion.update({
        where: { id: parsed.data.id },
        data: { nombre: parsed.data.nombre, nombreNormalizado },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { ok: false as const, message: MENSAJE_COLISION }
      }
      throw error
    }

    revalidatePath("/admin/congregaciones")
    return { ok: true as const }
  } catch (error) {
    console.error("Error renombrando congregación:", error)
    return { ok: false as const, message: "No se pudo renombrar la congregación." }
  }
}
