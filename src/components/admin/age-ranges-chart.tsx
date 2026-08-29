"use client"

import { useMemo } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AgeRangeKeys } from '@/lib/data/inscripciones';

type AgeRangesChartProps = {
  data: Record<AgeRangeKeys, number>
}

const labels: Record<AgeRangeKeys, string> = {
  [AgeRangeKeys.adolescentes]: "12 - 18",
  [AgeRangeKeys.jovenes]: "18 - 28",
  [AgeRangeKeys.masDe28]: "+28",
}

export function AgeRangesChart({ data }: AgeRangesChartProps) {
  const chartData = useMemo(() => {
    return (Object.keys(data) as AgeRangeKeys[]).map((key) => ({
      rango: labels[key],
      cantidad: data[key],
    }))
  }, [data])


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
