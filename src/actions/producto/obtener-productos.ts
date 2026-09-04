"use server"

import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"
import { toProductoAdminDTO } from "@/lib/data/productos"
import type { ProductoAdminDTO } from "@/interfaces/producto"

export async function obtenerProductos(): Promise<ProductoAdminDTO[]> {
  await requireCatalogo()

  const productos = await prisma.producto.findMany({
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  })

  return productos.map(toProductoAdminDTO)
}
