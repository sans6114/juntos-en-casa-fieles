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
import type { AgeRangeKey } from "@/lib/mock-data/inscripciones"

type AgeRangesChartProps = {
  data: Record<AgeRangeKey, number>
}

const labels: Record<AgeRangeKey, string> = {
  "12-18": "12 - 18",
  "18-28": "18 - 28",
  "+28": "+28",
}

export function AgeRangesChart({ data }: AgeRangesChartProps) {
  const chartData = (Object.keys(data) as AgeRangeKey[]).map((key) => ({
    rango: labels[key],
    cantidad: data[key],
  }))

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Rangos de edad</CardTitle>
        <CardDescription>Distribución de inscriptos por grupo etario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="rango" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Bar dataKey="cantidad" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
