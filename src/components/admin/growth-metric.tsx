"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type GrowthMetricProps = {
  totalActual: number
  totalAnterior: number
  crecimiento: number
  historial: Array<{ evento: string; total: number }>
}

export function GrowthMetric({
  totalActual,
  totalAnterior,
  crecimiento,
  historial,
}: GrowthMetricProps) {
  const isPositive = crecimiento >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Crecimiento vs evento anterior</CardTitle>
        <CardDescription>
          Comparativa entre el evento actual y el anterior ({totalAnterior} inscriptos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Evento actual</p>
            <p className="text-4xl font-bold tracking-tight">{totalActual}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Evento anterior</p>
            <p className="text-2xl font-semibold text-muted-foreground">{totalAnterior}</p>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
            )}
          >
            <TrendIcon className="size-4" />
            {isPositive ? "+" : ""}
            {crecimiento}%
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historial} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="evento" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--chart-3))"
                fill="url(#growthFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
