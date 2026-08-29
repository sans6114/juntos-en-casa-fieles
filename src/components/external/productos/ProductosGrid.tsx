import { PlaceholderTag } from '@/components/external/shared';

import {
  productos,
  PRODUCTOS_RESUELTO,
} from './data';
import { ProductoCard } from './ProductoCard';

export function ProductosGrid() {
  return (
    <section aria-label="Catálogo de productos" className="campo-papel px-6 pb-24 md:px-10 md:pb-28 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="sr-only">Productos</h2>

        {PRODUCTOS_RESUELTO ? (
          <div className="grid gap-5 md:grid-cols-2">
            {productos.map((item) => (
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
