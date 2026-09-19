import { AsistenciaGrupoStatCard } from "@/components/admin/asistencia-grupo-stat-card"
import type { AsistenciaDeGrupo } from "@/lib/data/inscripciones"

type AsistenciaPorGrupoProps = {
  grupos: AsistenciaDeGrupo[]
  totalInscriptos: number
  /** Inscripciones sin congregación atribuible. Hoy son cero. */
  sinDatoDeCongregacion: number
}

/**
 * Los tres grupos, en fila propia debajo de la asistencia general.
 *
 * Tres tarjetas y no una grilla de 3×2: cada grupo tiene su propia base, y por
 * lo tanto su propia lectura. Cada una lleva los dos días juntos por la misma
 * razón que la general —lo que se mira es la DISTANCIA entre ellos, que es
 * cuánta gente volvió—, y separarlos le daría esa resta al ojo.
 *
 * El renglón de abajo existe para que las tres tarjetas no mientan por omisión:
 * si alguna inscripción quedó sin congregación atribuible, los tres grupos no
 * suman el total, y quien lo note tiene que poder leer por qué en vez de salir
 * a buscar un bug. Con cero no se dibuja nada.
 *
 * Es server component: los hooks viven en cada tarjeta, no acá.
 */
export function AsistenciaPorGrupo({
  grupos,
  totalInscriptos,
  sinDatoDeCongregacion,
}: AsistenciaPorGrupoProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-4 sm:grid-cols-3">
        {grupos.map((datos) => (
          <AsistenciaGrupoStatCard
            key={datos.grupo}
            datos={datos}
            totalInscriptos={totalInscriptos}
          />
        ))}
      </div>

      {sinDatoDeCongregacion > 0 ? (
        <p className="text-xs text-muted-foreground">
          {sinDatoDeCongregacion}{" "}
          {sinDatoDeCongregacion === 1
            ? "inscripción queda"
            : "inscripciones quedan"}{" "}
          fuera de los tres grupos: declararon congregación pero un admin se la
          rechazó, así que no hay grupo que atribuirles. Los tres grupos suman{" "}
          {totalInscriptos - sinDatoDeCongregacion} de {totalInscriptos}.
        </p>
      ) : null}
    </div>
  )
}
