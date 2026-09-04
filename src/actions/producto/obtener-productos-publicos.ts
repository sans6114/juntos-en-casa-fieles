"use server"

import { prisma } from "@/lib/prisma"
import { toProductoPublicoDTO } from "@/lib/data/productos"
import type { ProductoPublicoDTO } from "@/interfaces/producto"

export async function obtenerProductosPublicos(): Promise<ProductoPublicoDTO[]> {
  const productos = await prisma.producto.findMany({
    where: { publicado: true },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  })

  return productos.map(toProductoPublicoDTO)
}
