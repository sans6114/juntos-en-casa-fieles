import { ArrowRightIcon, BrandName, PlaceholderTag } from "@/components/external/shared"
import { kickerDeProducto, type ProductoPublicoDTO } from "@/interfaces/producto"

import { ProductoFoto } from "./ProductoFoto"

type ProductoCardBodyProps = {
  item: ProductoPublicoDTO
}

/**
 * Contenido presentacional de la card: foto + kicker + título + descripción,
 * sin `Link`. La comparte el catálogo público (`ProductoCard`, envolviendo
 * esto en un `<Link>`) y —cuando exista una vista previa en vivo en el admin—
 * podría compartirla también, igual que `ContenidoCardBody` (design §D12).
 */
export function ProductoCardBody({ item }: ProductoCardBodyProps) {
  return (
    <>
      <ProductoFoto item={item} />

      <div className="flex flex-grow flex-col gap-3 p-6">
        <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]">
          <BrandName>{kickerDeProducto(item.categoriaNombre)}</BrandName>
        </p>

        <h3 className="jec-label text-2xl font-extrabold leading-tight tracking-tight">
          <BrandName>{item.titulo}</BrandName>
        </h3>

        <p className="text-sm leading-relaxed text-[var(--suave)]">
          <BrandName>{item.descripcion}</BrandName>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--linea)] pt-4">
          <PlaceholderTag>Precio a confirmar</PlaceholderTag>
          <ArrowRightIcon className="shrink-0 text-[var(--acento-texto)]" />
        </div>
      </div>
    </>
  )
}
