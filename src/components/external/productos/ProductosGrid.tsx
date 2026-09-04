import { PlaceholderTag } from "@/components/external/shared"
import type { ProductoPublicoDTO } from "@/interfaces/producto"

import { ProductoCard } from "./ProductoCard"

type ProductosGridProps = {
  items: ProductoPublicoDTO[]
}

export function ProductosGrid({ items }: ProductosGridProps) {
  return (
    <section aria-label="Catálogo de productos" className="campo-papel px-6 pb-24 md:px-10 md:pb-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="sr-only">Productos</h2>

        {items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((item) => (
              <ProductoCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 border-t-[3px] border-[var(--regla)] pt-8">
            <PlaceholderTag>Próximamente...</PlaceholderTag>
          </div>
        )}
      </div>
    </section>
  )
}
