"use client"

import {
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { AsistenciaCell } from '@/components/admin/asistencia-cell';
import { QrEnvioCell } from '@/components/admin/qr-envio-cell';
import { ReenviarPendientesButton } from '@/components/admin/reenviar-pendientes-button';
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
import type { DiaEvento } from '@/interfaces/asistencia';
import type { InscripcionDTO } from '@/interfaces/inscripcion';

type InscripcionesTableProps = {
  data: InscripcionDTO[]
  isAdmin?: boolean
  /**
   * Qué día de evento es hoy, resuelto en el servidor. `null` cuando hoy no se
   * acredita. Llega como prop porque depende de variables de entorno.
   */
  diaDeHoy?: DiaEvento | null
}

const PAGE_SIZE = 10

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

/** Hora de acreditación para la lista impresa, o una casilla para tildar a mano. */
function formatHoraCorta(iso: string | null) {
  if (!iso) return "☐"

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    // Ver la nota en `qr-envio-cell.tsx`: `hour12` rompe la hidratacion.
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso))
}

export function InscripcionesTable({
  data,
  isAdmin = false,
  diaDeHoy = null,
}: InscripcionesTableProps) {
  const [query, setQuery] = useState("")
  const [soloQrPendiente, setSoloQrPendiente] = useState(false)
  const [page, setPage] = useState(1)

  // "Pendiente" es NUNCA enviado con éxito, no "el último intento falló": quien
  // ya recibió su QR no entra en la lista de trabajo aunque un reintento
  // posterior haya fallado. Ya lo tiene.
  // Las altas de puerta sin email quedan fuera: no hay a dónde mandarles nada,
  // así que nunca van a tener `emailEnviadoAt` y se acumularían para siempre
  // inflando un contador que tiene que servir para decidir.
  const qrPendientes = useMemo(
    () => data.filter((item) => item.email && !item.emailEnviadoAt).length,
    [data]
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return data.filter((item) => {
      if (soloQrPendiente && (item.emailEnviadoAt || !item.email)) return false
      if (!normalized) return true

      return (
        item.nombre.toLowerCase().includes(normalized) ||
        (item.email?.toLowerCase().includes(normalized) ?? false) ||
        (item.telefono?.toLowerCase().includes(normalized) ?? false) ||
        (item.congregacionNombre?.toLowerCase().includes(normalized) ?? false)
      )
    })
  }, [data, query, soloQrPendiente])

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
        <div className="flex flex-wrap items-center gap-2">
          {/* Convierte un problema invisible en una lista de trabajo. Solo
              aparece cuando hay algo que hacer. */}
          {qrPendientes > 0 ? (
            <Button
              variant={soloQrPendiente ? "default" : "outline"}
              className="gap-2"
              onClick={() => {
                setSoloQrPendiente((previo) => !previo)
                setPage(1)
              }}
            >
              <AlertTriangle className="size-4" />
              QR sin enviar ({qrPendientes})
            </Button>
          ) : null}

          <ReenviarPendientesButton pendientes={qrPendientes} />

          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir PDF
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card print:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Acreditación</TableHead>
              <TableHead>QR</TableHead>
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
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No se encontraron inscripciones.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((item) => {
                const canOpenDetail = isAdmin || item.puedeContactar
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-base font-medium">
                      {canOpenDetail ? (
                        <Link
                          href={`/admin/inscripciones/${item.id}`}
                          className="text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950"
                        >
                          {item.nombre}
                          {item.puedeContactar ? (
                            <span className="ml-2 text-sm font-normal text-amber-700">
                              · contactar
                            </span>
                          ) : null}
                        </Link>
                      ) : (
                        item.nombre
                      )}
                    </TableCell>
                    {/* Inline en la fila, NO detrás de la ficha: un COLABORADOR
                        solo puede abrir el detalle de candidatos pastorales, asi
                        que desde la ficha no podria acreditar a casi nadie. */}
                    <TableCell>
                      <AsistenciaCell
                        inscripcionId={item.id}
                        nombre={item.nombre}
                        asistenciaDia1={item.asistenciaDia1}
                        asistenciaDia2={item.asistenciaDia2}
                        diaDeHoy={diaDeHoy}
                      />
                    </TableCell>
                    <TableCell>
                      <QrEnvioCell
                        inscripcionId={item.id}
                        nombre={item.nombre}
                        email={item.email}
                        telefono={item.telefono}
                        qrUrl={item.qrUrl}
                        emailEnviadoAt={item.emailEnviadoAt}
                        emailError={item.emailError}
                      />
                    </TableCell>
                    <TableCell>{item.email ?? "—"}</TableCell>
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
                      {item.puedeContactar ? (
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
              {/* La lista impresa es el ultimo recurso si el dia del evento se
                  cae internet o la app: las casillas vacias se tildan a mano. */}
              <th className="py-1.5 pr-2 font-semibold">Día 1</th>
              <th className="py-1.5 pr-2 font-semibold">Día 2</th>
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
                <td className="py-1.5 pr-2">{formatHoraCorta(item.asistenciaDia1)}</td>
                <td className="py-1.5 pr-2">{formatHoraCorta(item.asistenciaDia2)}</td>
                <td className="py-1.5 pr-2">{item.email ?? "—"}</td>
                <td className="py-1.5 pr-2">{item.telefono ?? "—"}</td>
                <td className="py-1.5 pr-2">{item.edad}</td>
                <td className="py-1.5 pr-2">
                  {item.congregacionNombre ?? "Sin congregación"}
                </td>
                <td className="py-1.5 pr-2">
                  {item.puedeContactar
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
