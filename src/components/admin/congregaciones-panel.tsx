"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import {
  aprobarCongregacion,
  fusionarCongregaciones,
  rechazarCongregacion,
  renombrarCongregacion,
} from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CongregacionAdminDTO } from "@/interfaces/congregacion"

type CongregacionesPanelProps = {
  data: CongregacionAdminDTO[]
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function CongregacionesPanel({ data }: CongregacionesPanelProps) {
  const [isPending, startTransition] = useTransition()

  const [renameTarget, setRenameTarget] = useState<CongregacionAdminDTO | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const [mergeTarget, setMergeTarget] = useState<CongregacionAdminDTO | null>(null)
  const [mergeCanonicaId, setMergeCanonicaId] = useState("")

  const [rejectTarget, setRejectTarget] = useState<CongregacionAdminDTO | null>(null)

  const openRename = (congregacion: CongregacionAdminDTO) => {
    setRenameTarget(congregacion)
    setRenameValue(congregacion.nombre)
  }

  const openMerge = (congregacion: CongregacionAdminDTO) => {
    setMergeTarget(congregacion)
    setMergeCanonicaId("")
  }

  const handleAprobar = (id: string) => {
    startTransition(async () => {
      const result = await aprobarCongregacion(id)
      if (result.ok) {
        toast.success("Congregación aprobada")
      } else {
        toast.error(result.message ?? "No se pudo aprobar")
      }
    })
  }

  const handleRenombrar = () => {
    if (!renameTarget) return
    startTransition(async () => {
      const result = await renombrarCongregacion({ id: renameTarget.id, nombre: renameValue })
      if (result.ok) {
        toast.success("Congregación renombrada")
        setRenameTarget(null)
      } else {
        toast.error(result.message ?? "No se pudo renombrar")
      }
    })
  }

  const handleFusionar = () => {
    if (!mergeTarget || !mergeCanonicaId) return
    startTransition(async () => {
      const result = await fusionarCongregaciones({
        duplicadaId: mergeTarget.id,
        canonicaId: mergeCanonicaId,
      })
      if (result.ok) {
        toast.success("Congregaciones fusionadas")
        setMergeTarget(null)
      } else {
        toast.error(result.message ?? "No se pudo fusionar")
      }
    })
  }

  const handleRechazar = () => {
    if (!rejectTarget) return
    startTransition(async () => {
      const result = await rechazarCongregacion(rejectTarget.id)
      if (result.ok) {
        toast.success("Congregación rechazada")
        setRejectTarget(null)
      } else {
        toast.error(result.message ?? "No se pudo rechazar")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Congregaciones</h2>
        <p className="text-sm text-muted-foreground">
          Aprobá, renombrá, fusioná o rechazá las congregaciones cargadas por los visitantes
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Inscripciones</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay congregaciones registradas.
                </TableCell>
              </TableRow>
            ) : (
              data.map((congregacion) => (
                <TableRow key={congregacion.id}>
                  <TableCell className="font-medium">{congregacion.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={congregacion.estado === "APROBADA" ? "default" : "outline"}>
                      {congregacion.estado === "APROBADA" ? "Aprobada" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell>{congregacion.totalInscripciones}</TableCell>
                  <TableCell>{formatDate(congregacion.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" disabled={isPending}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {congregacion.estado === "PENDIENTE" ? (
                          <DropdownMenuItem onClick={() => handleAprobar(congregacion.id)}>
                            Aprobar
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem onClick={() => openRename(congregacion)}>
                          Renombrar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMerge(congregacion)}>
                          Fusionar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setRejectTarget(congregacion)}
                        >
                          Rechazar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar congregación</DialogTitle>
            <DialogDescription>
              Actualizá el nombre mostrado. Si el nuevo nombre coincide con otra congregación
              existente, usá Fusionar en su lugar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="renombrar-nombre">Nombre</Label>
            <Input
              id="renombrar-nombre"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleRenombrar} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mergeTarget !== null} onOpenChange={(open) => !open && setMergeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fusionar congregación</DialogTitle>
            <DialogDescription>
              &ldquo;{mergeTarget?.nombre}&rdquo; se eliminará y sus inscripciones pasarán a la
              congregación que elijas. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="fusionar-destino">Fusionar con</Label>
            <Select value={mergeCanonicaId} onValueChange={(value) => setMergeCanonicaId(value ?? "")}>
              <SelectTrigger id="fusionar-destino" className="w-full">
                <SelectValue placeholder="Elegí la congregación destino" />
              </SelectTrigger>
              <SelectContent>
                {data
                  .filter((congregacion) => congregacion.id !== mergeTarget?.id)
                  .map((congregacion) => (
                    <SelectItem key={congregacion.id} value={congregacion.id}>
                      {congregacion.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeTarget(null)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleFusionar} disabled={isPending || !mergeCanonicaId}>
              {isPending ? "Fusionando..." : "Fusionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar congregación</DialogTitle>
            <DialogDescription>
              &ldquo;{rejectTarget?.nombre}&rdquo; se eliminará y sus inscripciones pasarán a la
              cola de contacto pastoral como &ldquo;sin congregación&rdquo;. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRechazar} disabled={isPending}>
              {isPending ? "Rechazando..." : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
