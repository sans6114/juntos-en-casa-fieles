"use server"

import { prisma } from "@/lib/prisma"
import { INCLUIR_ARCHIVOS, toContenidoPublicoDTO } from "@/lib/data/contenidos"
import type { ContenidoPublicoDTO } from "@/interfaces/contenido"

export async function obtenerContenidoPorSlug(slug: string): Promise<ContenidoPublicoDTO | null> {
  const contenido = await prisma.contenido.findUnique({
    where: { slug },
    include: INCLUIR_ARCHIVOS,
  })
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
    include: INCLUIR_ARCHIVOS,
    orderBy: { createdAt: "desc" }, // D16: no existe columna `orden`
    take: limit,
  })

  return contenidos.map(toContenidoPublicoDTO)
}
