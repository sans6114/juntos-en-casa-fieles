import { UserCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DiaAsistencia = {
  total: number
  porcentaje: number
}

type AsistenciaStatCardProps = {
  dia1: DiaAsistencia
  dia2: DiaAsistencia
  /** El denominador de los dos porcentajes. */
  totalInscriptos: number
}

/**
 * Qué porcentaje de los inscriptos vino cada día.
 *
 * Card propia y no dos `StatCard` sueltas porque los dos días son UNA lectura:
 * lo que se mira no es cada porcentaje por separado sino la distancia entre
 * ellos, que es cuánta gente volvió el sábado. Separados en dos tarjetas esa
 * comparación queda a cargo del ojo y se pierde.
 *
 * Los absolutos van al lado del porcentaje y no escondidos en un tooltip: "72%"
 * sin el "259 de 360" no se puede accionar, y quien supervisa necesita el número
 * crudo para cruzarlo con lo que ve en el salón.
 *
 * Es server component: no hay nada que tocar acá.
 */
export function AsistenciaStatCard({
  dia1,
  dia2,
  totalInscriptos,
}: AsistenciaStatCardProps) {
  // "Día 1" y "Día 2" y no "Viernes"/"Sábado": nombrar el día de la semana acá
  // duplicaría conocimiento sobre las fechas, y si alguna se mueve la tarjeta
  // pasa a mentir sin que nada lo note. Además es el mismo vocabulario que ya
  // usan los badges D1/D2 de la grilla.
  const dias = [
    { etiqueta: "Día 1", dato: dia1 },
    { etiqueta: "Día 2", dato: dia2 },
  ]

  return (
    <Card className="border-l-4 border-l-[var(--jec-admin-accent)] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Asistencia
        </CardTitle>
        <UserCheck className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          {dias.map(({ etiqueta, dato }) => (
            <div key={etiqueta}>
              <dt className="text-xs font-medium text-muted-foreground">{etiqueta}</dt>
              <dd className="mt-0.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  {dato.porcentaje}%
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {dato.total}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Sobre {totalInscriptos} inscriptos. El domingo no se acredita.
        </p>
      </CardContent>
    </Card>
  )
}
