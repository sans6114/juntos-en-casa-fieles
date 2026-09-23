import { Card, CardContent } from "@/components/ui/card"
import type { ResumenAsistencia } from "@/interfaces/inscripcion"

type ResumenAsistenciaProps = {
  resumen: ResumenAsistencia
}

/**
 * Los cuatro destinos posibles de un inscripto, en una sola barra.
 *
 * Estos cuatro grupos SÍ son excluyentes y SÍ suman el total, a diferencia de
 * las solapas de abajo, que se superponen. Por eso van juntos y en una barra
 * proporcional: lo que hay que poder ver de un vistazo es qué tajada del evento
 * se perdió, y cuatro tarjetas sueltas dejan esa comparación a cargo del ojo.
 *
 * Es server component: no hay nada que tocar acá.
 */
export function ResumenAsistencia({ resumen }: ResumenAsistenciaProps) {
  const { totalInscriptos, nunca, soloDia1, soloDia2, ambosDias } = resumen

  const porcentaje = (parte: number) =>
    totalInscriptos === 0 ? 0 : Math.round((parte / totalInscriptos) * 100)

  // Orden de mejor a peor, que es como se lee una retención. El color va de
  // lleno a vacío en la misma dirección.
  const tramos = [
    { etiqueta: "Vinieron los dos días", valor: ambosDias, clase: "bg-[var(--jec-admin-accent)]" },
    { etiqueta: "Solo el día 1", valor: soloDia1, clase: "bg-[var(--jec-admin-accent)]/60" },
    { etiqueta: "Solo el día 2", valor: soloDia2, clase: "bg-[var(--jec-admin-accent)]/35" },
    { etiqueta: "No vinieron nunca", valor: nunca, clase: "bg-muted-foreground/25" },
  ]

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Qué pasó con los {totalInscriptos} inscriptos
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {porcentaje(nunca)}%
            </span>{" "}
            no llegó a entrar
          </p>
        </div>

        {/* `flex` con anchos porcentuales y no un grid: los tramos tienen que
            ser proporcionales al dato, que es lo unico que hace legible la
            comparacion sin leer los numeros. */}
        <div
          className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`De ${totalInscriptos} inscriptos: ${ambosDias} vinieron los dos días, ${soloDia1} solo el día 1, ${soloDia2} solo el día 2, ${nunca} no vinieron nunca.`}
        >
          {tramos.map(({ etiqueta, valor, clase }) =>
            valor > 0 ? (
              <div
                key={etiqueta}
                className={clase}
                style={{ width: `${(valor / totalInscriptos) * 100}%` }}
              />
            ) : null
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {tramos.map(({ etiqueta, valor, clase }) => (
            <div key={etiqueta}>
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`size-2 shrink-0 rounded-full ${clase}`} aria-hidden />
                {etiqueta}
              </dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight tabular-nums">{valor}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {porcentaje(valor)}%
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
