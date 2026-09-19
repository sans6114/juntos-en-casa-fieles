"use client"

import { useState } from "react"

import { Building2, Church, UserPlus, type LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import type { AsistenciaDeGrupo, GrupoAsistencia } from "@/lib/data/inscripciones"

const ICONO_GRUPO: Record<GrupoAsistencia, LucideIcon> = {
  vidaSobrenatural: Church,
  otraCongregacion: Building2,
  sinCongregacion: UserPlus,
}

type AsistenciaGrupoStatCardProps = {
  datos: AsistenciaDeGrupo
  /** Base total del evento: el denominador de `participacion`. */
  totalInscriptos: number
}

/**
 * Cuánta de la gente de UN grupo apareció, por día.
 *
 * El porcentaje grande se mide contra los inscriptos del propio grupo, no
 * contra el total del evento: la pregunta que se contesta acá es si ese grupo
 * respondió la invitación, y para eso 40 de 84 dice algo que 40 de 517 no.
 *
 * Se abre al hover en escritorio y al toque en mobile, igual que
 * `GrowthStatCard`: el número de la cara sirve para decidir de un vistazo, y
 * los absolutos —que son los que se cruzan con lo que se ve en el salón— viven
 * a un gesto de distancia en vez de cargar la tarjeta.
 */
export function AsistenciaGrupoStatCard({
  datos,
  totalInscriptos,
}: AsistenciaGrupoStatCardProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const Icono = ICONO_GRUPO[datos.grupo]

  // Un grupo sin inscriptos no tiene 0% de asistencia: no tiene porcentaje. El
  // guard de `porcentaje()` devuelve 0 para que nada se rompa; acá se dice la
  // verdad, porque "0%" afirmaría que nadie vino de gente que no existe.
  const vacio = datos.inscriptos === 0

  // "Día 1" y "Día 2", nunca los días de la semana: nombrarlos acá duplicaría
  // conocimiento sobre las fechas y la tarjeta pasaría a mentir sola si alguna
  // se corre. Es el mismo criterio que `AsistenciaStatCard` y los badges D1/D2.
  const dias = [
    { etiqueta: "Día 1", dato: datos.dia1 },
    { etiqueta: "Día 2", dato: datos.dia2 },
  ]

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (isMobile) setOpen(next)
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className="w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onMouseEnter={() => {
              if (!isMobile) setOpen(true)
            }}
            onMouseLeave={() => {
              if (!isMobile) setOpen(false)
            }}
            onClick={() => {
              if (isMobile) setOpen((prev) => !prev)
            }}
          />
        }
      >
        <Card className="border-l-4 border-l-[var(--jec-admin-accent)] shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {datos.etiqueta}
            </CardTitle>
            <Icono className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* `text-2xl` y no `text-3xl`: la tarjeta general de arriba es la
                que manda, estas tres la desglosan. */}
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {dias.map(({ etiqueta, dato }) => (
                <div key={etiqueta}>
                  <dt className="text-xs font-medium text-muted-foreground">{etiqueta}</dt>
                  <dd className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight tabular-nums">
                      {vacio ? "—" : `${dato.porcentaje}%`}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {dato.total}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            {/* El denominador va en la CARA y no solo en el detalle: sin él,
                tres porcentajes uno al lado del otro invitan a compararlos como
                si midieran lo mismo. */}
            <p className="mt-3 text-xs text-muted-foreground">
              {vacio
                ? "Sin inscriptos en este grupo."
                : `Sobre ${datos.inscriptos} inscriptos del grupo.`}
            </p>
          </CardContent>
        </Card>
      </PopoverTrigger>

      {/* Los mismos handlers que en el trigger: sin esto el popover se cierra
          apenas el cursor sale de la tarjeta para entrar en él. */}
      <PopoverContent
        align="start"
        side="bottom"
        className="w-72 p-3"
        onMouseEnter={() => {
          if (!isMobile) setOpen(true)
        }}
        onMouseLeave={() => {
          if (!isMobile) setOpen(false)
        }}
      >
        <PopoverHeader>
          <PopoverTitle>{datos.etiqueta}</PopoverTitle>
          <PopoverDescription>
            Números exactos del grupo y su peso sobre el total
          </PopoverDescription>
        </PopoverHeader>
        <dl className="mt-1 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Inscriptos del grupo</dt>
            <dd className="font-semibold tabular-nums">{datos.inscriptos}</dd>
          </div>

          {/* "de {inscriptos}" repetido en cada fila es redundancia a propósito:
              cada renglón tiene que poder leerse solo. */}
          {dias.map(({ etiqueta, dato }) => (
            <div key={etiqueta} className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">
                Vinieron el {etiqueta.toLowerCase()}
              </dt>
              <dd className="font-semibold tabular-nums">
                {dato.total} de {datos.inscriptos}
                {vacio ? "" : ` (${dato.porcentaje}%)`}
              </dd>
            </div>
          ))}

          {/* El OTRO denominador, separado por la regla justamente para que no
              se lea como una cuarta fila de la misma serie: este porcentaje se
              mide sobre el evento entero, los de arriba sobre el grupo. */}
          <div className="flex items-center justify-between gap-3 border-t pt-2">
            <dt className="text-muted-foreground">Sobre el total del evento</dt>
            <dd className="font-semibold text-neutral-800 tabular-nums">
              {datos.inscriptos} de {totalInscriptos} ({datos.participacion}%)
            </dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  )
}
