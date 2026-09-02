import type { Contenido, ContenidoArchivo } from "../../../generated/client"
import { CAMPO_A_CLASE, MIMES_ARCHIVO, TIPO_A_KIND, contarPlacas } from "@/interfaces/contenido"
import type {
  ContenidoAdminDTO,
  ContenidoArchivoDTO,
  ContenidoPublicoDTO,
  MimeArchivo,
} from "@/interfaces/contenido"

/**
 * La fila tal como la leen las acciones: siempre con sus archivos incluidos y
 * ya ordenados (`include: { archivos: { orderBy: { orden: "asc" } } }`).
 */
export type ContenidoConArchivos = Contenido & { archivos: ContenidoArchivo[] }

/**
 * Include acotado —y no un `include` general— que exigen los dos mappers. Se
 * declara una sola vez para que ninguna consulta se olvide del `orderBy`: sin
 * él, el orden que armó el admin en el panel se pierde.
 */
export const INCLUIR_ARCHIVOS = {
  archivos: { orderBy: { orden: "asc" } },
} as const

function esMimeConocido(mime: string): mime is MimeArchivo {
  return (MIMES_ARCHIVO as readonly string[]).includes(mime)
}

/**
 * `mime` es `String` en la base, así que una fila vieja o escrita a mano podría
 * traer cualquier cosa. Las desconocidas se descartan en vez de castearse: es
 * preferible no ofrecer un archivo que ofrecer uno que el front no sabe pintar.
 */
function toArchivoDTO(archivos: ContenidoArchivo[]): ContenidoArchivoDTO[] {
  return archivos
    .filter((archivo) => esMimeConocido(archivo.mime))
    .map((archivo) => ({
      url: archivo.url,
      mime: archivo.mime as MimeArchivo,
      orden: archivo.orden,
      paginas: archivo.paginas ?? undefined,
    }))
}

/**
 * Mapper Prisma-row → DTO, server-side. Vive acá (no en `interfaces/`) para
 * no meter el tipo de fila de Prisma en un archivo que debe ser seguro de
 * importar desde un "use client" (A2). Único caso con más de un call site
 * (`obtenerContenidosPublicos`, `obtenerContenidoPorSlug`,
 * `obtenerContenidosRelacionados`) — precedente de helper puro en
 * `src/lib/data/`: `getInscripcionesMetrics` (`inscripciones.ts:23`).
 */
export function toContenidoPublicoDTO(row: ContenidoConArchivos): ContenidoPublicoDTO {
  const placas = toArchivoDTO(row.archivos)

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
    placas,
    placasCount: contarPlacas(placas),
  }
}

export function toContenidoAdminDTO(row: ContenidoConArchivos): ContenidoAdminDTO {
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
    archivos: toArchivoDTO(row.archivos),
    campo: row.campo,
    imagenSrc: row.imagenSrc ?? undefined,
    imagenCover: row.imagenCover,
    imagenAtenuada: row.imagenAtenuada,
    publicado: row.publicado,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
