import Link from "next/link"
import { ArrowRightIcon, BrandName, PlaceholderTag } from "@/components/external/shared"

import { ProductoPieza } from "./ProductoPieza"
import type { ProductoItem } from "./data"

type ProductoCardProps = {
  item: ProductoItem
}

export function ProductoCard({ item }: ProductoCardProps) {
  return (
    <article className="h-full">
      <Link
        href={`/productos/${item.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--linea)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--regla)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)] motion-reduce:transform-none"
      >
        <ProductoPieza item={item} />

        <div className="flex flex-grow flex-col gap-3 p-6">
          <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]">
            <BrandName>{item.kicker}</BrandName>
          </p>

          <h3 className="jec-label text-2xl font-extrabold leading-tight tracking-tight">
            <BrandName>{item.title}</BrandName>
          </h3>

          <p className="text-sm leading-relaxed text-[var(--suave)]">
            <BrandName>{item.description}</BrandName>
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--linea)] pt-4">
            <PlaceholderTag>Precio a confirmar</PlaceholderTag>
            <ArrowRightIcon className="shrink-0 text-[var(--acento-texto)]" />
          </div>
        </div>
      </Link>
    </article>
  )
}
