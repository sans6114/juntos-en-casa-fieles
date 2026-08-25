export type GaleriaFoto = {
  id: string
  /**
   * Path under `public/jec/`. Absent while no real photo exists — the tile then
   * renders as a marked placeholder instead of an invented image.
   */
  src?: string
  /** Required once `src` is set; a decorative gallery still needs real alt text. */
  alt?: string
  /** Tiles that read better across two columns (wide group shots). */
  span?: "wide"
}

/**
 * Photos from the previous edition.
 *
 * There are no event photos in `public/jec/` yet, so every entry is intentionally
 * srcless: the grid keeps its shape and each tile says so in its rendered text.
 * Drop the files under `public/jec/galeria/` and fill `src` + `alt` one by one.
 */
export const galeriaEdition = 2025

export const galeriaFotos: readonly GaleriaFoto[] = [
  { id: "foto-1", span: "wide" },
  { id: "foto-2" },
  { id: "foto-3" },
  { id: "foto-4" },
  { id: "foto-5" },
  { id: "foto-6", span: "wide" },
]
