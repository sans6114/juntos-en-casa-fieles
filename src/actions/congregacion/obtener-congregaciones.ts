"use server"

import { prisma } from "@/lib/prisma"

export async function obtenerCongregaciones() {
  return prisma.congregacion.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })
}
