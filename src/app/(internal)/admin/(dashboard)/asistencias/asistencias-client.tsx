"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AsistenciaDTO } from "@/interfaces/inscripcion"

function formatTime(isoString: string) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString))
}

type AsistenciasClientProps = {
  dia1: AsistenciaDTO[]
  dia2: AsistenciaDTO[]
  dia3: AsistenciaDTO[]
}

export function AsistenciasClient({ dia1, dia2, dia3 }: AsistenciasClientProps) {
  const [query, setQuery] = useState("")

  const filterData = (data: AsistenciaDTO[]) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data
    return data.filter(
      (item) =>
        item.nombre.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized) ||
        (item.telefono?.toLowerCase().includes(normalized) ?? false)
    )
  }

  const filteredDia1 = useMemo(() => filterData(dia1), [dia1, query])
  const filteredDia2 = useMemo(() => filterData(dia2), [dia2, query])
  const filteredDia3 = useMemo(() => filterData(dia3), [dia3, query])

  const renderTable = (data: AsistenciaDTO[]) => (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Hora de llegada</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No hay asistencias registradas.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell>{formatTime(item.horaLlegada)}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.telefono ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar asistente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="dia1" className="w-full">
        <TabsList>
          <TabsTrigger value="dia1">Día 1 ({dia1.length})</TabsTrigger>
          <TabsTrigger value="dia2">Día 2 ({dia2.length})</TabsTrigger>
          <TabsTrigger value="dia3">Día 3 ({dia3.length})</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="dia1">{renderTable(filteredDia1)}</TabsContent>
          <TabsContent value="dia2">{renderTable(filteredDia2)}</TabsContent>
          <TabsContent value="dia3">{renderTable(filteredDia3)}</TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
