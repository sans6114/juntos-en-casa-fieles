import { jecAssets } from "@/lib/jec-assets"

/** Product kinds for the public /productos exhibition. */
export type ProductoKind = "indumentaria" | "papeleria"

/**
 * A colour variant of the drawn piece. Only the remera carries variants — a
 * garment sold in more than one colourway. See design.md §3.
 */
export type ProductoVariante = {
  id: string
  label: string
  /** "campo-tinta" | "campo-papel" | "campo-fuego" */
  field: string
  prendaFill: string
  prendaStroke: string
  /** A jecAssets.logos.* path. */
  wordmark: string
}

export type ProductoItem = {
  id: string
  /** Route segment for /productos/[slug]. Unique. */
  slug: string
  kind: ProductoKind
  title: string
  kicker: string
  badge: string
  /** Card copy. */
  description: string
  /** Detail-page "Sobre la pieza" copy. */
  detalle: string
  pieza: "remera" | "stickers"
  /** The field its piece frame sits on by default. */
  field: string
  variantes?: readonly ProductoVariante[]
  ficha: readonly { term: string; value: string; placeholder?: boolean }[]
  /** Undefined until real photography exists; see design.md §3. */
  foto?: string
}

/**
 * Flag manual: el catálogo de productos abajo es placeholder (precio, talles y
 * material sin confirmar). En false, /productos muestra el estado "Próximamente"
 * en vez del grid. Pasar a true (o quitar la bandera) cuando el usuario confirme
 * los productos reales del evento.
 */
export const PRODUCTOS_RESUELTO = false

// TODO(productos-exhibicion): confirmar con el usuario — precio, talles y
// material son placeholders; description y detalle son copy estructural a
// revisar antes de publicar.
export const productos: readonly ProductoItem[] = [
  {
    id: "remera-jec-2026",
    slug: "remera-jec-2026",
    kind: "indumentaria",
    title: "Remera Juntos En Casa 2026",
    kicker: "Indumentaria · Juntos En Casa 2026",
    badge: "Remera",
    description:
      "La remera oficial de Juntos En Casa 2026: estampa al frente, para llevar la conferencia puesta todo el año.",
    detalle:
      "Corte unisex con el isotipo de Juntos En Casa estampado al frente. Se consigue únicamente en el stand del evento, sin venta online — la idea es que te la lleves puesta desde ahí mismo.",
    pieza: "remera",
    field: "campo-tinta",
    variantes: [
      {
        id: "tinta",
        label: "Tinta",
        field: "campo-tinta",
        prendaFill: "#f4efe8",
        prendaStroke: "#0b0a0f",
        wordmark: jecAssets.logos.wordmarkBlack,
      },
      {
        id: "hueso",
        label: "Hueso",
        field: "campo-papel",
        prendaFill: "#0b0a0f",
        prendaStroke: "#0b0a0f",
        wordmark: jecAssets.logos.wordmarkWhite,
      },
      {
        id: "fuego",
        label: "Fuego",
        field: "campo-fuego",
        prendaFill: "#f4efe8",
        prendaStroke: "#0b0a0f",
        wordmark: jecAssets.logos.wordmarkBlack,
      },
    ],
    ficha: [
      { term: "Talles", value: "A confirmar", placeholder: true },
      { term: "Material", value: "A confirmar", placeholder: true },
      { term: "Estampa", value: "Wordmark al frente" },
      { term: "Dónde", value: "Stand del evento" },
    ],
  },
  {
    id: "pack-stickers",
    slug: "pack-stickers",
    kind: "papeleria",
    title: "Pack de stickers Juntos En Casa 2026",
    kicker: "Papelería · Juntos En Casa 2026",
    badge: "Stickers",
    description:
      "Un pack de stickers con los íconos y el isotipo de Juntos En Casa 2026, para pegar donde quieras.",
    detalle:
      "Cuatro diseños troquelados con símbolos de la conferencia: el isotipo, la llama y el ancla. Se consigue únicamente en el stand del evento, sin venta online.",
    pieza: "stickers",
    field: "campo-fuego",
    ficha: [
      { term: "Talles", value: "A confirmar", placeholder: true },
      { term: "Material", value: "A confirmar", placeholder: true },
      { term: "Estampa", value: "Diseños originales Juntos En Casa 2026" },
      { term: "Dónde", value: "Stand del evento" },
    ],
  },
]

export function findProducto(slug: string) {
  return productos.find((item) => item.slug === slug)
}

/** Other products to surface at the end of a detail page. */
export function relatedProductos(slug: string, limit = 3) {
  return productos.filter((item) => item.slug !== slug).slice(0, limit)
}
