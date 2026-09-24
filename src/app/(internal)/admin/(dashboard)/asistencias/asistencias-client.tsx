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
    // `hour12` rompe la hidratacion (ver la nota en `qr-envio-cell.tsx`), y sin
    // `timeZone` el server formatea en la zona del contenedor y el navegador en
    // la del visitante: dos horas distintas para el mismo dato.
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(isoString))
}

type AsistenciasClientProps = {
  dia1: AsistenciaDTO[]
  dia2: AsistenciaDTO[]
}

export function AsistenciasClient({ dia1, dia2 }: AsistenciasClientProps) {
  const [query, setQuery] = useState("")

  /**
   * `email` se lee con `?.` porque PUEDE ser null: quien se anota en la puerta
   * no da dirección. Sin eso, buscar cualquier nombre reventaba con un
   * "Cannot read properties of null" apenas el filtro llegaba a una de esas
   * filas —y el `||` hace que llegue siempre que el nombre NO coincida, o sea
   * en casi todas—.
   *
   * Va dentro del `useMemo` y no afuera: definida afuera se recreaba en cada
   * render y quedaba como dependencia faltante del memo, que es lo que eslint
   * venía marcando.
   */
  const filtrar = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return (data: AsistenciaDTO[]) => {
      if (!normalized) return data

      return data.filter(
        (item) =>
          item.nombre.toLowerCase().includes(normalized) ||
          (item.email?.toLowerCase().includes(normalized) ?? false) ||
          (item.telefono?.toLowerCase().includes(normalized) ?? false)
      )
    }
  }, [query])

  const filteredDia1 = useMemo(() => filtrar(dia1), [dia1, filtrar])
  const filteredDia2 = useMemo(() => filtrar(dia2), [dia2, filtrar])

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
                {/* Mismo guion que en la grilla para quien se anotó sin mail,
                    en vez de una celda vacía que se lee como un dato perdido. */}
                <TableCell>{item.email ?? "—"}</TableCell>
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
        </TabsList>
        <div className="mt-4">
          <TabsContent value="dia1">{renderTable(filteredDia1)}</TabsContent>
          <TabsContent value="dia2">{renderTable(filteredDia2)}</TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
