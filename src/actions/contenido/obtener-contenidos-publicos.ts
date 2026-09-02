"use server"

import { prisma } from "@/lib/prisma"
import { INCLUIR_ARCHIVOS, toContenidoPublicoDTO } from "@/lib/data/contenidos"
import type { ContenidoKind, ContenidoPublicoDTO, TipoContenido } from "@/interfaces/contenido"

const KIND_A_TIPO: Record<ContenidoKind, TipoContenido> = {
  predica: "PREDICA",
  video: "VIDEO",
  recursos: "RECURSOS",
}

export async function obtenerContenidosPublicos(
  kind?: ContenidoKind
): Promise<ContenidoPublicoDTO[]> {
  const contenidos = await prisma.contenido.findMany({
    where: {
      publicado: true,
      ...(kind ? { tipo: KIND_A_TIPO[kind] } : {}),
    },
    include: INCLUIR_ARCHIVOS,
    orderBy: { createdAt: "desc" }, // D16: no existe columna `orden`
  })

  return contenidos.map(toContenidoPublicoDTO)
}
