import Link from "next/link"
import { cn } from "@/lib/utils"

import type { ContenidoKind } from "@/interfaces/contenido"

/** `undefined` is the "Todo" filter — it renders as `/contenidos` with no query. */
const FILTROS: { value?: ContenidoKind; label: string }[] = [
  { value: undefined, label: "Todo" },
  { value: "predica", label: "Prédicas" },
  { value: "video", label: "Videos" },
  { value: "recursos", label: "Recursos" },
]

type ContenidosFiltrosProps = {
  active?: ContenidoKind
  total: number
}

/**
 * Filtering happens through the URL, not client state: each chip is a plain link
 * and the page re-renders on the server. Keeps the catalog a Server Component,
 * works without JavaScript, and every filtered view is shareable.
 */
export function ContenidosFiltros({ active, total }: ContenidosFiltrosProps) {
  return (
    <div className="flex flex-col gap-4 border-t-[3px] border-[var(--regla)] pt-7 md:flex-row md:items-center md:justify-between">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 md:flex-wrap md:overflow-visible">
        {FILTROS.map((filtro) => {
          const isActive = filtro.value === active
          return (
            <Link
              key={filtro.label}
              href={filtro.value ? `/contenidos?tipo=${filtro.value}` : "/contenidos"}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "jec-label inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]",
                isActive
                  ? "border-[var(--dato)] bg-[var(--dato)] text-[var(--sup)]"
                  : "border-[var(--linea)] text-[var(--suave)] hover:text-[var(--dato)]"
              )}
            >
              {filtro.label}
            </Link>
          )
        })}
      </div>

      <p
        aria-live="polite"
        className="jec-mono text-sm font-bold uppercase tracking-[0.14em] text-[var(--suave)]"
      >
        {total} {total === 1 ? "contenido" : "contenidos"}
      </p>
    </div>
  )
}
