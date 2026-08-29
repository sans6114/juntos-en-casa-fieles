import { jecAssets } from "@/lib/jec-assets"

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

/** Photos from the previous edition. */
export const galeriaEdition = 2025

export const galeriaFotos: readonly GaleriaFoto[] = [
  {
    id: "foto-1",
    span: "wide",
    src: jecAssets.galeria.foto1,
    alt: "Un grupo de chicos posando y sonriendo entre las butacas, con las pantallas del escenario detrás.",
  },
  {
    id: "foto-2",
    src: jecAssets.galeria.foto2,
    alt: "Cuatro jóvenes del staff sonriendo juntos frente al escenario.",
  },
  {
    id: "foto-3",
    src: jecAssets.galeria.foto3,
    alt: "Una chica con la mano en alto durante un momento de adoración, con luces cálidas de fondo.",
  },
  {
    id: "foto-4",
    src: jecAssets.galeria.foto4,
    alt: "El público con las manos levantadas durante la adoración, bajo las luces del escenario.",
  },
  {
    id: "foto-5",
    src: jecAssets.galeria.foto5,
    alt: "Tres chicos abrazados y sonriendo, con el escenario iluminado detrás.",
  },
  {
    id: "foto-6",
    span: "wide",
    src: jecAssets.galeria.foto6,
    alt: "Una chica con los ojos cerrados en un momento de oración, entre el resto del público.",
  },
]

/** Link al álbum completo de fotos en Google Drive. */
export const galeriaDriveUrl =
  "https://drive.google.com/drive/folders/1aEqHbjqBu_nNQZgHI0tvyZoHfIYWD5c8?usp=sharing"
