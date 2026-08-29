import type { Contenido } from "../../../generated/client"
import { CAMPO_A_CLASE, TIPO_A_KIND } from "@/interfaces/contenido"
import type { ContenidoAdminDTO, ContenidoPublicoDTO } from "@/interfaces/contenido"

/**
 * Mapper Prisma-row → DTO, server-side. Vive acá (no en `interfaces/`) para
 * no meter el tipo de fila de Prisma en un archivo que debe ser seguro de
 * importar desde un "use client" (A2). Único caso con más de un call site
 * (`obtenerContenidosPublicos`, `obtenerContenidoPorSlug`,
 * `obtenerContenidosRelacionados`) — precedente de helper puro en
 * `src/lib/data/`: `getInscripcionesMetrics` (`inscripciones.ts:23`).
 */
export function toContenidoPublicoDTO(row: Contenido): ContenidoPublicoDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.titulo,
    description: row.descripcion,
    kind: TIPO_A_KIND[row.tipo],
    edition: row.edicion,
    thumb: {
      field: CAMPO_A_CLASE[row.campo],
      src: row.imagenSrc ?? undefined,
      fit: row.imagenCover ? "cover" : "contain",
      dim: row.imagenAtenuada,
    },
    session: row.sesion ?? undefined,
    speaker: row.orador ?? undefined,
    youtubeId: row.youtubeId ?? undefined,
    durationLabel: row.duracion ?? undefined,
    placasUrl: row.placasUrl ?? undefined,
    placasCount: row.placasCount ?? undefined,
  }
}

export function toContenidoAdminDTO(row: Contenido): ContenidoAdminDTO {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    edicion: row.edicion,
    sesion: row.sesion ?? undefined,
    orador: row.orador ?? undefined,
    youtubeId: row.youtubeId ?? undefined,
    duracion: row.duracion ?? undefined,
    placasUrl: row.placasUrl ?? undefined,
    placasCount: row.placasCount ?? undefined,
    campo: row.campo,
    imagenSrc: row.imagenSrc ?? undefined,
    imagenCover: row.imagenCover,
    imagenAtenuada: row.imagenAtenuada,
    publicado: row.publicado,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
