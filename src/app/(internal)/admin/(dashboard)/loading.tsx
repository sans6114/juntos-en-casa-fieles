import { Skeleton } from "@/components/ui/skeleton"

/**
 * Pantalla de espera de TODO el panel.
 *
 * No existía ninguna, y esa ausencia es lo que hacía sentir lento al portal.
 * Sin un `loading.tsx` no hay límite de Suspense, así que App Router deja la
 * pantalla anterior congelada hasta que el servidor termina de renderizar:
 * medido acá, el primer píxel que cambiaba era el de la página nueva. Tocabas
 * un link y no pasaba absolutamente nada —ni spinner, ni el link marcándose
 * como activo— durante todo el tiempo de espera.
 *
 * El problema nunca fue el tiempo. En producción son 330-550 ms, que está bien.
 * El problema era que durante esos 550 ms no había acuse de recibo del click, y
 * media pantalla muerta se lee como "se trabó" por corta que sea la espera.
 *
 * Todas las páginas del panel son dinámicas: `requireSession()` lee cookies, así
 * que ninguna se puede pre-renderizar y cada navegación es servidor completo más
 * consulta a la base. Eso está bien y no se cambia. Lo que faltaba era avisar.
 *
 * El sidebar y el encabezado móvil no parpadean: viven en el layout, que
 * persiste entre navegaciones. Esto solo reemplaza el área de contenido.
 */
export default function CargandoPanel() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>

      {/* Mismas medidas que `AdminHeader` para que no salte el layout cuando
          llega el contenido real. */}
      <div className="flex flex-col gap-2 border-b border-border bg-background px-6 py-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full sm:max-w-sm" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          {/* Ocho filas: llenan el alto típico sin fingir que ya se sabe cuántas
              van a llegar. */}
          {Array.from({ length: 8 }).map((_, fila) => (
            <div
              key={fila}
              className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="hidden h-4 w-32 md:block" />
              <Skeleton className="hidden h-4 w-20 lg:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
