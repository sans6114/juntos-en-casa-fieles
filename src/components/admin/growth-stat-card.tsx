"use client"

import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

type GrowthStatCardProps = {
  totalActual: number
  totalAnterior: number
  crecimiento: number
}

export function GrowthStatCard({
  totalActual,
  totalAnterior,
  crecimiento,
}: GrowthStatCardProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const diferencia = totalActual - totalAnterior
  const isPositive = crecimiento >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (isMobile) setOpen(next)
      }}
    >
      <PopoverTrigger
        render={
          <div
            className="w-full cursor-pointer text-left"
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
        <StatCard
          title="Crecimiento"
          value={`${crecimiento >= 0 ? "+" : ""}${crecimiento}%`}
          description="Comparado con el evento anterior"
          icon={TrendIcon}
          accent="red"
          className="transition-shadow hover:shadow-md"
          trend={{
            value: crecimiento,
            label: "vs evento anterior",
            positive: isPositive,
          }}
        />
      </PopoverTrigger>
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
          <PopoverTitle>Detalle de crecimiento</PopoverTitle>
          <PopoverDescription>
            Números absolutos del evento actual vs el anterior
          </PopoverDescription>
        </PopoverHeader>
        <dl className="mt-1 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Evento actual</dt>
            <dd className="font-semibold tabular-nums">{totalActual}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Evento anterior</dt>
            <dd className="font-semibold tabular-nums">{totalAnterior}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-2">
            <dt className="text-muted-foreground">Diferencia</dt>
            <dd className="font-semibold text-neutral-800 tabular-nums">
              {diferencia >= 0 ? "+" : ""}
              {diferencia}
            </dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  )
}
