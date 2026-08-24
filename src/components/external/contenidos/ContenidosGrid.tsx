import { ContenidoCard } from "./ContenidoCard"
import { ContenidosFiltros } from "./ContenidosFiltros"
import { contenidos, type ContenidoKind } from "./data"

type ContenidosGridProps = {
  /** Active kind filter, read from the `?tipo=` search param by the page. */
  tipo?: ContenidoKind
}

export function ContenidosGrid({ tipo }: ContenidosGridProps) {
  const visibles = tipo ? contenidos.filter((item) => item.kind === tipo) : contenidos

  return (
    <section
      id="catalogo"
      aria-label="Catálogo de contenidos"
      className="campo-papel jec-anchor px-6 pb-24 md:px-10 md:pb-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <ContenidosFiltros active={tipo} total={visibles.length} />

        {visibles.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibles.map((item) => (
              <ContenidoCard key={item.id} item={item} />
            ))}
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
