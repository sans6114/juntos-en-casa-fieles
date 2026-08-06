"use client"

import {
  useMemo,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InscripcionDTO } from '@/interfaces/inscripcion';

type InscripcionesTableProps = {
  data: InscripcionDTO[]
  isAdmin?: boolean
}

const PAGE_SIZE = 10

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function InscripcionesTable({ data, isAdmin = false }: InscripcionesTableProps) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data

    return data.filter(
      (item) =>
        item.nombre.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized) ||
        (item.telefono?.toLowerCase().includes(normalized) ?? false) ||
        (item.congregacionNombre?.toLowerCase().includes(normalized) ?? false)
    )
  }, [data, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o congregación..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Imprimir PDF
        </Button>
      </div>

      <div className="rounded-lg border bg-card print:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Congregación</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron inscripciones.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((item) => {
                const canOpenDetail = isAdmin || item.congregacionId === null
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-base font-medium">
                      {canOpenDetail ? (
                        <Link
                          href={`/admin/inscripciones/${item.id}`}
                          className="text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950"
                        >
                          {item.nombre}
                          {item.congregacionId === null ? (
                            <span className="ml-2 text-sm font-normal text-amber-700">
                              · contactar
                            </span>
                          ) : null}
                        </Link>
                      ) : (
                        item.nombre
                      )}
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.telefono ?? "—"}</TableCell>
                    <TableCell>{item.edad}</TableCell>
                    <TableCell>
                      {item.congregacionNombre ? (
                        <Badge variant="secondary">{item.congregacionNombre}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin congregación</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.congregacionId === null ? (
                        item.contactado ? (
                          <Badge>Contactado</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <p className="text-sm text-muted-foreground">
          Mostrando {pageItems.length} de {filtered.length} inscripciones
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="hidden text-black print:block">
        <div className="flex items-center gap-4 border-b-2 border-black pb-3">
          <Image
            src="/jec/logos/logoVSnegro.png"
            alt="Logo Juntos en Casa"
            width={48}
            height={48}
            priority
          />
          <div>
            <h2 className="text-xl font-bold">
              Juntos en casa 2026 - inscriptos
            </h2>
            <p className="text-xs text-gray-600">
              {filtered.length} inscriptos · Generado el{" "}
              {new Intl.DateTimeFormat("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </p>
          </div>
        </div>

        <table className="mt-4 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="py-1.5 pr-2 font-semibold">Nombre</th>
              <th className="py-1.5 pr-2 font-semibold">Email</th>
              <th className="py-1.5 pr-2 font-semibold">Teléfono</th>
              <th className="py-1.5 pr-2 font-semibold">Edad</th>
              <th className="py-1.5 pr-2 font-semibold">Congregación</th>
              <th className="py-1.5 pr-2 font-semibold">Contacto</th>
              <th className="py-1.5 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-1.5 pr-2">{item.nombre}</td>
                <td className="py-1.5 pr-2">{item.email}</td>
                <td className="py-1.5 pr-2">{item.telefono ?? "—"}</td>
                <td className="py-1.5 pr-2">{item.edad}</td>
                <td className="py-1.5 pr-2">
                  {item.congregacionNombre ?? "Sin congregación"}
                </td>
                <td className="py-1.5 pr-2">
                  {item.congregacionId === null
                    ? item.contactado
                      ? "Contactado"
                      : "Pendiente"
                    : "—"}
                </td>
                <td className="py-1.5">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
