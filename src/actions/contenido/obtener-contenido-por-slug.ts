"use server"

import { prisma } from "@/lib/prisma"
import { toContenidoPublicoDTO } from "@/lib/data/contenidos"
import type { ContenidoPublicoDTO } from "@/interfaces/contenido"

export async function obtenerContenidoPorSlug(slug: string): Promise<ContenidoPublicoDTO | null> {
  const contenido = await prisma.contenido.findUnique({ where: { slug } })
  if (!contenido || !contenido.publicado) {
    return null
  }
  return toContenidoPublicoDTO(contenido)
}

export async function obtenerContenidosRelacionados(
  slug: string,
  limit = 3
): Promise<ContenidoPublicoDTO[]> {
  const contenidos = await prisma.contenido.findMany({
    where: {
      publicado: true,
      slug: { not: slug },
    },
    orderBy: { createdAt: "desc" }, // D16: no existe columna `orden`
    take: limit,
  })

  return contenidos.map(toContenidoPublicoDTO)
}
