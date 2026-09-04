import Link from "next/link"
import type { ProductoPublicoDTO } from "@/interfaces/producto"

import { ProductoCardBody } from "./ProductoCardBody"

type ProductoCardProps = {
  item: ProductoPublicoDTO
}

export function ProductoCard({ item }: ProductoCardProps) {
  return (
    <article className="h-full">
      <Link
        href={`/productos/${item.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--linea)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--regla)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)] motion-reduce:transform-none"
      >
        <ProductoCardBody item={item} />
      </Link>
    </article>
  )
}
