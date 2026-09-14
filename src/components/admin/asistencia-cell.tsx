"use client"

import { useTransition } from "react"

import { Check, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { ajustarAsistencia, marcarAsistenciaHoy } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DiaEvento } from "@/interfaces/asistencia"

type AsistenciaCellProps = {
  inscripcionId: string
  nombre: string
  /** Hora ISO de acreditación de cada día, o `null` si todavía no llegó. */
  asistenciaDia1: string | null
  asistenciaDia2: string | null
  /** Qué día de evento es hoy. `null` cuando hoy no se acredita. */
  diaDeHoy: DiaEvento | null
  /** Días que ya empezaron. Solo esos se pueden marcar como presentes. */
  diasHabilitados: DiaEvento[]
}

function formatHora(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    // Ver la nota en `qr-envio-cell.tsx`: con `hour12` el ICU del servidor y el
    // del navegador usan espacios distintos y React tira error de hidratacion.
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso))
}

export function AsistenciaCell({
  inscripcionId,
  nombre,
  asistenciaDia1,
  asistenciaDia2,
  diaDeHoy,
  diasHabilitados,
}: AsistenciaCellProps) {
  const [isPending, startTransition] = useTransition()

  const porDia: Record<DiaEvento, string | null> = {
    1: asistenciaDia1,
    2: asistenciaDia2,
  }

  const acreditadoHoy = diaDeHoy ? porDia[diaDeHoy] : null

  function acreditar() {
    startTransition(async () => {
      const resultado = await marcarAsistenciaHoy(inscripcionId)

      if (resultado.ok) {
        toast.success(`Acreditado: ${resultado.nombre} (${resultado.horaLlegada} hs)`)
      } else {
        toast.error(resultado.message)
      }
    })
  }

  function corregir(dia: DiaEvento, presente: boolean) {
    startTransition(async () => {
      const resultado = await ajustarAsistencia({ inscripcionId, dia, presente })

      if (resultado.ok) {
        toast.success(
          presente
            ? `${nombre}: día ${dia} marcado como presente.`
            : `${nombre}: día ${dia} desmarcado.`
        )
      } else {
        toast.error(resultado.message)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Camino rápido de puerta: un solo tap, y solo aparece los días que se
          acredita. El resto del año la celda muestra el estado y nada más. */}
      {diaDeHoy ? (
        acreditadoHoy ? (
          <Badge className="gap-1">
            <Check className="size-3" />
            {formatHora(acreditadoHoy)}
          </Badge>
        ) : (
          <Button size="sm" onClick={acreditar} disabled={isPending}>
            {isPending ? "…" : "Acreditar"}
          </Button>
        )
      ) : null}

      {/* Estado de los dos días, siempre visible. Los días ya acreditados se ven
          aunque hoy no sea día de evento: es lo que mira quien supervisa. */}
      <div className="flex items-center gap-1">
        {([1, 2] as const).map((dia) => {
          const hora = porDia[dia]
          const esHoy = diaDeHoy === dia

          // El badge de hoy ya está representado por el botón/badge de arriba.
          if (esHoy) return null

          return (
            <Badge
              key={dia}
              variant={hora ? "secondary" : "outline"}
              className={hora ? undefined : "text-muted-foreground"}
              title={hora ? `Día ${dia}: ${formatHora(hora)} hs` : `Día ${dia}: sin acreditar`}
            >
              D{dia}
              {hora ? <Check className="ml-1 size-3" /> : null}
            </Badge>
          )
        })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" disabled={isPending}>
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Corregir acreditación de {nombre}</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {/* `DropdownMenuLabel` envuelve `Menu.GroupLabel` de Base UI, que
              EXIGE un `Menu.Group` padre: sin el grupo tira "MenuGroupContext is
              missing" y revienta la página entera al abrir el menú. */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Corregir acreditación</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {([1, 2] as const).map((dia) => {
              const presente = Boolean(porDia[dia])
              // Desmarcar se ofrece siempre: es la salida de un dato mal
              // cargado. Marcar, solo un día que ya empezó — acreditar a alguien
              // en un día que no ocurrió no corrige nada, y el escáner después
              // le contesta "ya acreditado" en la puerta.
              const bloqueado = !presente && !diasHabilitados.includes(dia)

              return (
                <DropdownMenuItem
                  key={dia}
                  disabled={bloqueado}
                  onClick={() => corregir(dia, !presente)}
                >
                  {presente ? `Desmarcar día ${dia}` : `Marcar día ${dia}`}
                  {/* Deshabilitado y visible, no escondido: una opción que
                      desaparece deja al colaborador buscándola. */}
                  {bloqueado ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      todavía no empezó
                    </span>
                  ) : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
