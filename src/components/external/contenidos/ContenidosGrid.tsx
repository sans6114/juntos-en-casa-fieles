import { PlaceholderTag } from "@/components/external/shared"
import type { ContenidoKind, ContenidoPublicoDTO } from "@/interfaces/contenido"

import { ContenidoCard } from "./ContenidoCard"
import { ContenidosFiltros } from "./ContenidosFiltros"

type ContenidosGridProps = {
  /** Active kind filter, read from the `?tipo=` search param by the page. */
  tipo?: ContenidoKind
  /** Published items matching the active filter, already resolved by the page. */
  items: ContenidoPublicoDTO[]
  /**
   * True when the whole catalog has zero published items, regardless of the
   * active filter — distinct from a filter that simply matches nothing.
   */
  catalogoVacio: boolean
}

export function ContenidosGrid({ tipo, items, catalogoVacio }: ContenidosGridProps) {
  return (
    <section
      id="catalogo"
      aria-label="Catálogo de contenidos"
      className="campo-papel jec-anchor px-6 pb-24 md:px-10 md:pb-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/*
          Cerraba el salto h1 -> h3: `ContenidosIntro` pone el h1 y cada
          `ContenidoCard` un h3, sin nada en el medio. El titulo es sr-only porque
          la seccion ya se lee sola visualmente; lo que faltaba era el nivel, no un
          encabezado a la vista.
        */}
        <h2 className="sr-only">Catálogo de contenidos</h2>

        <ContenidosFiltros active={tipo} total={items.length} />

        {items.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContenidoCard key={item.id} item={item} />
            ))}
          </div>
        ) : catalogoVacio ? (
          <div className="mt-10 flex flex-col items-start gap-3 border-t-[3px] border-[var(--regla)] pt-8">
            <PlaceholderTag>Próximamente...</PlaceholderTag>
            <p className="max-w-xl text-base leading-relaxed text-[var(--suave)]">
              Estamos subiendo las prédicas, los videos y los recursos de esta edición. Volvé en
              unos días y vas a encontrar todo acá.
            </p>
          </div>
        ) : (
          <p className="mt-10 text-base text-[var(--suave)]">
            Todavía no hay contenidos de este tipo publicados.
          </p>
        )}
      </div>
    </section>
  )
}
