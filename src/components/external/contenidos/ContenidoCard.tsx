import Link from "next/link"
import type { ContenidoVista } from "@/interfaces/contenido"

import { ContenidoCardBody } from "./ContenidoCardBody"
import type { ContenidoItem, ContenidoKind } from "./data"

type ContenidoCardProps = {
  item: ContenidoItem
}

/**
 * Adaptador temporal `ContenidoKind` (taxonomía vieja de `./data`, slice 9) →
 * el `ContenidoKind` nuevo que expone `ContenidoVista` (slice 2). Existe
 * solo mientras el catálogo público siga leyendo del `data.ts` estático: el
 * corte del slice 8 (design §B8) reemplaza esta fuente por
 * `ContenidoPublicoDTO` — que ya nace con la taxonomía nueva — y este
 * adaptador deja de hacer falta.
 */
const KIND_A_VISTA: Record<ContenidoKind, ContenidoVista["kind"]> = {
  predica: "predica",
  podcast: "video",
  recurso: "recursos",
}

function toVista(item: ContenidoItem): ContenidoVista {
  return { ...item, kind: KIND_A_VISTA[item.kind] }
}

export function ContenidoCard({ item }: ContenidoCardProps) {
  return (
    <article className="h-full">
      <Link
        href={`/contenidos/${item.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--linea)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--regla)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)] motion-reduce:transform-none"
      >
        <ContenidoCardBody item={toVista(item)} />
      </Link>
    </article>
  )
}
