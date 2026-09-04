"use client"

import { useSearchParams } from "next/navigation"

import type { ContenidoKind, ContenidoPublicoDTO } from "@/interfaces/contenido"

import { ContenidosGrid } from "./ContenidosGrid"

const KINDS: ContenidoKind[] = ["predica", "video", "recursos"]

/** Un `?tipo=` desconocido cae en "Todo", igual que cuando filtraba el servidor. */
function parseTipo(value: string | null): ContenidoKind | undefined {
  return KINDS.find((kind) => kind === value)
}

type ContenidosCatalogoProps = {
  /** El catálogo completo, resuelto en el build. */
  items: ContenidoPublicoDTO[]
}

/**
 * Aplica el filtro `?tipo=` en el cliente.
 *
 * El filtrado se movió acá para que `/contenidos` se pueda prerenderizar: una
 * página que lee `searchParams` nunca es estática, y bajo prerender Next
 * devuelve `{}` (`packages/next/src/server/request/search-params.ts`:
 * `if (workStore.forceStatic) return Promise.resolve({})`).
 *
 * Es seguro filtrar en memoria porque la lista filtrada siempre fue un
 * subconjunto estricto de la completa: `obtenerContenidosPublicos` solo agrega
 * un predicado de igualdad sobre `tipo`, con el mismo `orderBy` y sin `take`.
 *
 * Lo que se pierde: sin JavaScript los chips no filtran — se ve el catálogo
 * entero. Las URLs siguen siendo compartibles, porque el filtro sigue viviendo
 * en el query string y no en estado interno.
 */
export function ContenidosCatalogo({ items }: ContenidosCatalogoProps) {
  const tipo = parseTipo(useSearchParams().get("tipo"))
  const visibles = tipo ? items.filter((item) => item.kind === tipo) : items

  return <ContenidosGrid tipo={tipo} items={visibles} catalogoVacio={items.length === 0} />
}
