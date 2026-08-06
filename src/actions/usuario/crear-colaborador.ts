"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { CrearColaboradorSchema, type CrearColaboradorDTO } from "@/interfaces/usuario"

export async function crearColaborador(data: CrearColaboradorDTO) {
  try {
    await requireAdmin()

    const parsed = CrearColaboradorSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })
    if (existing) {
      return { ok: false as const, message: "Ya existe un usuario con ese email." }
    }

    const password = await bcrypt.hash(parsed.data.password, 10)

    await prisma.user.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        password,
        rol: "COLABORADOR",
        activo: true,
      },
    })

    revalidatePath("/admin/usuarios")
    return { ok: true as const }
  } catch (error) {
    console.error("Error creando colaborador:", error)
    return { ok: false as const, message: "No se pudo crear el colaborador." }
  }
}
