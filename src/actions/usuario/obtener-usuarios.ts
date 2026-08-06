"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import type { UsuarioDTO } from "@/interfaces/usuario"

export async function obtenerUsuarios(): Promise<UsuarioDTO[]> {
  await requireAdmin()

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return users.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    activo: u.activo,
    createdAt: u.createdAt.toISOString(),
  }))
}
