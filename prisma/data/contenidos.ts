import type { CampoThumb, TipoContenido } from "../../generated/client"

/**
 * Semilla de `Contenido`. Ships EMPTY a propósito (decisión 2): el catálogo
 * real se carga con el script `prisma/scripts/migrar-contenidos-iniciales.ts`
 * (decisión 11), no con `prisma db seed`.
 *
 * Valores válidos de los enums, para referencia rápida al completar entradas:
 *   TipoContenido: "PREDICA" | "VIDEO" | "RECURSOS"
 *   CampoThumb:    "CAMPO_PAPEL" | "CAMPO_TINTA" | "CAMPO_FUEGO"
 *
 * `imagenSrc` es una URL de Vercel Blob subida desde el panel, o una ruta
 * relativa `/jec/...` de las filas anteriores al upload — las dos ramas del
 * validador en `src/interfaces/contenido.ts`.
 */
export type ContenidoSeed = {
  slug: string
  titulo: string
  descripcion: string
  tipo: TipoContenido
  edicion: number
  sesion?: string
  orador?: string
  youtubeId?: string
  duracion?: string
  placasUrl?: string
  placasCount?: number
  campo: CampoThumb
  imagenSrc?: string
  imagenCover?: boolean
  imagenAtenuada?: boolean
  publicado?: boolean
  /**
   * Override opcional de `createdAt` (por defecto `now()` en el schema). Lo
   * usa `prisma/scripts/migrar-contenidos-iniciales.ts` para escalonar las
   * fechas de los seis items rescatados y preservar su orden original una
   * vez publicados, ya que `orderBy` en las lecturas públicas es
   * `createdAt: "desc"` (D16).
   */
  createdAt?: Date
}

export const contenidosSeed: ContenidoSeed[] = []
