import Link from "next/link"
import type { ContenidoPublicoDTO } from "@/interfaces/contenido"

import { ContenidoCardBody } from "./ContenidoCardBody"

type ContenidoCardProps = {
  item: ContenidoPublicoDTO
}

export function ContenidoCard({ item }: ContenidoCardProps) {
  return (
    <article className="h-full">
      <Link
        href={`/contenidos/${item.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--linea)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--regla)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)] motion-reduce:transform-none"
      >
        <ContenidoCardBody item={item} />
      </Link>
    </article>
  )
}
