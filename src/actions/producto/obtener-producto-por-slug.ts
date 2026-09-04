"use server"

import { prisma } from "@/lib/prisma"
import { toProductoPublicoDTO } from "@/lib/data/productos"
import type { ProductoPublicoDTO } from "@/interfaces/producto"

export async function obtenerProductoPorSlug(slug: string): Promise<ProductoPublicoDTO | null> {
  const producto = await prisma.producto.findUnique({
    where: { slug },
    include: { categoria: true },
  })
  if (!producto || !producto.publicado) {
    return null
  }
  return toProductoPublicoDTO(producto)
}

export async function obtenerProductosRelacionados(
  slug: string,
  limit = 3
): Promise<ProductoPublicoDTO[]> {
  const productos = await prisma.producto.findMany({
    where: { publicado: true, slug: { not: slug } },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return productos.map(toProductoPublicoDTO)
}
