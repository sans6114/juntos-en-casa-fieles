"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { INCLUIR_ARCHIVOS, toContenidoAdminDTO } from "@/lib/data/contenidos"
import type { ContenidoAdminDTO } from "@/interfaces/contenido"

export async function obtenerContenidos(): Promise<ContenidoAdminDTO[]> {
  await requireAdmin()

  const contenidos = await prisma.contenido.findMany({
    include: INCLUIR_ARCHIVOS,
    orderBy: { createdAt: "desc" }, // D16: no existe columna `orden`
  })

  return contenidos.map(toContenidoAdminDTO)
}
