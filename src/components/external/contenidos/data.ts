import { jecAssets } from "@/lib/jec-assets"

/** Content kinds for the public /contenidos catalog. */
export type ContenidoKind = "predica" | "podcast" | "recurso"

/**
 * Thumbnail treatment. There are no photographic thumbnails in `public/jec/`,
 * so a thumbnail is a brand-colour block that may carry one real brand asset.
 */
export type ContenidoThumb = {
  field: "campo-papel" | "campo-tinta" | "campo-fuego"
  src?: string
  /** "contain" keeps a mascot/logo whole; "cover" fills the frame with artwork. */
  fit?: "contain" | "cover"
  /** Dim a "cover" asset so the play badge stays legible on top of it. */
  dim?: boolean
}

export type ContenidoItem = {
  id: string
  /** Route segment for /contenidos/[slug]. Unique. */
  slug: string
  title: string
  description: string
  kind: ContenidoKind
  /** Edition the content belongs to. */
  edition: number
  thumb: ContenidoThumb
  /** Session within the schedule, e.g. "Apertura · Viernes". Absent for non-session content. */
  session?: string
  /**
   * Speaker name. Deliberately absent for the 2025 edition: the six names in
   * `invitados/data.ts` are the 2026 line-up, so attributing them to 2025
   * recordings would invent a fact. The UI marks an absent speaker as pending.
   */
  speaker?: string
  /** YouTube video id. Paste the id only — not the full watch URL. */
  youtubeId?: string
  durationLabel?: string
  /** URL of the shareable-graphics archive. */
  placasUrl?: string
  placasCount?: number
}

const KIND_LABEL: Record<ContenidoKind, string> = {
  predica: "Prédica",
  podcast: "Podcast",
  recurso: "Recursos",
}

export function kindLabel(kind: ContenidoKind) {
  return KIND_LABEL[kind]
}

/**
 * Catalog for the public UI.
 *
 * Pending real data — every entry is placeholder until these land:
 * - `youtubeId`: no video ids are known. While absent the detail page renders a
 *   marked placeholder instead of the embed. Paste the id here to switch it on.
 * - `placasUrl`: no archive exists in the repo. While absent the download
 *   affordance is replaced by a marked note.
 * - `speaker`: see the field docs above.
 */
export const contenidos: readonly ContenidoItem[] = [
  {
    id: "anclados-en-la-roca",
    slug: "anclados-en-la-roca",
    title: "Anclados en la roca",
    description:
      "La noche que abrió la conferencia: de dónde agarrarse cuando todo lo demás se mueve.",
    kind: "predica",
    edition: 2025,
    session: "Apertura · Viernes",
    durationLabel: "48:12",
    thumb: { field: "campo-tinta", src: jecAssets.hero.finale, fit: "cover", dim: true },
  },
  {
    id: "permaneciendo-en-la-palabra",
    slug: "permaneciendo-en-la-palabra",
    title: "Permaneciendo en la Palabra",
    description:
      "Qué significa quedarse, en un tiempo donde irse es siempre la opción más fácil.",
    kind: "predica",
    edition: 2025,
    session: "Jornada plena · Sábado",
    durationLabel: "52:40",
    thumb: { field: "campo-fuego", src: jecAssets.personaje.llama, fit: "contain" },
  },
  {
    id: "caminando-en-la-verdad",
    slug: "caminando-en-la-verdad",
    title: "Caminando en la verdad",
    description:
      "El último día: lo que te llevás puertas afuera, cuando la conferencia termina.",
    kind: "predica",
    edition: 2025,
    session: "Cierre · Domingo",
    durationLabel: "44:05",
    thumb: { field: "campo-tinta", src: jecAssets.personaje.apuntando, fit: "contain" },
  },
  {
    id: "podcast-juntos",
    slug: "podcast-juntos-en-casa",
    title: "Podcast Juntos En Casa",
    description:
      "Conversaciones con el equipo y los invitados sobre fe, comunidad y lo que se viene en la conferencia.",
    kind: "podcast",
    edition: 2026,
    durationLabel: "31:18",
    thumb: { field: "campo-tinta", src: jecAssets.recursos.logoColor, fit: "contain" },
  },
  {
    id: "podcast-previa",
    slug: "previa-al-encuentro",
    title: "Previa al encuentro",
    description:
      "Episodios cortos para prepararte: qué esperar, cómo llegar y cómo vivir el fin de semana juntos.",
    kind: "podcast",
    edition: 2026,
    durationLabel: "18:52",
    thumb: { field: "campo-papel", src: jecAssets.recursos.logoNegro, fit: "contain" },
  },
  {
    id: "placas-para-compartir",
    slug: "placas-para-compartir",
    title: "Placas para compartir",
    description:
      "Las frases de cada prédica en formato historia y post, listas para tus redes.",
    kind: "recurso",
    edition: 2025,
    placasCount: 24,
    thumb: { field: "campo-fuego" },
  },
]

export function findContenido(slug: string) {
  return contenidos.find((item) => item.slug === slug)
}

/** Other content to surface at the end of a detail page. */
export function relatedContenidos(slug: string, limit = 3) {
  return contenidos.filter((item) => item.slug !== slug).slice(0, limit)
}
