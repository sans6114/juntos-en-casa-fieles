"use client"

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
  const chartData = [
    ...data.map((item) => ({ congregacion: item.nombre, cantidad: item.total })),
    ...(sinCongregacion > 0
      ? [{ congregacion: "Sin congregación", cantidad: sinCongregacion }]
      : []),
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Inscriptos por congregación</CardTitle>
        <CardDescription>Cantidad de personas registradas por sede</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="congregacion"
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Bar dataKey="cantidad" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
