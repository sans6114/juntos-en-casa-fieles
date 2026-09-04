"use server"

import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"
import type { CategoriaProductoDTO } from "@/interfaces/producto"

/** Categorías disponibles para el `<Select>` del form de producto. Mirror de
 *  `obtener-recursos-vinculables.ts`, incluido el `select` acotado. */
export async function obtenerCategoriasProducto(): Promise<CategoriaProductoDTO[]> {
  await requireCatalogo()

  return prisma.categoriaProducto.findMany({
    select: { id: true, slug: true, nombre: true },
    orderBy: { createdAt: "desc" },
  })
}
