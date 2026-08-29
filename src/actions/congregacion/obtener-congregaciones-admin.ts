"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import type { CongregacionAdminDTO } from "@/interfaces/congregacion"

export async function obtenerCongregacionesAdmin(): Promise<CongregacionAdminDTO[]> {
  await requireAdmin()

  const congregaciones = await prisma.congregacion.findMany({
    include: { _count: { select: { inscripciones: true } } },
    orderBy: [{ estado: "asc" }, { nombre: "asc" }],
  })

  return congregaciones.map((cg) => ({
    id: cg.id,
    nombre: cg.nombre,
    nombreNormalizado: cg.nombreNormalizado,
    estado: cg.estado,
    totalInscripciones: cg._count.inscripciones,
    createdAt: cg.createdAt.toISOString(),
  }))
}
