"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type CongregationsChartProps = {
  data: Array<{ nombre: string; total: number }>
  sinCongregacion: number
}

export function CongregationsChart({ data, sinCongregacion }: CongregationsChartProps) {
  const chartData = useMemo(() => {
    return [
      ...data.map((item) => ({ congregacion: item.nombre, cantidad: item.total })),
      ...(sinCongregacion > 0
        ? [{ congregacion: "Sin congregación", cantidad: sinCongregacion }]
        : []),
    ]
  }, [data, sinCongregacion])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Inscriptos por congregación</CardTitle>
        <CardDescription>Distribución de personas registradas por sede</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="congregacion"
                width={150}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--jec-admin-accent) 12%, transparent)" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
              <Bar
                dataKey="cantidad"
                fill="var(--jec-admin-accent)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
