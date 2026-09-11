"use client"

import { useId, useState, useTransition } from "react"

import { Plus, UserCheck } from "lucide-react"
import { toast } from "sonner"

import { crearInscripcionManual, marcarAsistenciaHoy } from "@/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CrearInscripcionManualDTO, TipoCongregacion } from "@/interfaces/inscripcion"

type Congregacion = { id: string; nombre: string }

type AltaInscripcionDialogProps = {
  congregaciones: Congregacion[]
  /** `true` cuando hoy se acredita: cambia la promesa que hace el diálogo. */
  esDiaDeEvento: boolean
}

type FieldErrors = Partial<Record<keyof CrearInscripcionManualDTO, string>>

const VALORES_INICIALES = {
  nombre: "",
  email: "",
  telefono: "",
  edad: "",
  tipoCongregacion: "" as TipoCongregacion | "",
  congregacionQuery: "",
}

export function AltaInscripcionDialog({
  congregaciones,
  esDiaDeEvento,
}: AltaInscripcionDialogProps) {
  const datalistId = useId()
  const [open, setOpen] = useState(false)
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [yaInscripto, setYaInscripto] = useState<{ id: string; nombre: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof typeof VALORES_INICIALES>(
    campo: K,
    valor: (typeof VALORES_INICIALES)[K]
  ) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  function cerrar() {
    setOpen(false)
    setValores(VALORES_INICIALES)
    setFieldErrors({})
    setYaInscripto(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setYaInscripto(null)

    startTransition(async () => {
      const resultado = await crearInscripcionManual({
        nombre: valores.nombre,
        email: valores.email,
        telefono: valores.telefono,
        edad: Number(valores.edad),
        tipoCongregacion: valores.tipoCongregacion as TipoCongregacion,
        congregacionQuery: valores.congregacionQuery,
        congregacionId: null,
      })

      if (resultado.ok) {
        toast.success(
          resultado.acreditada
            ? `${resultado.nombre} inscripto y acreditado (${resultado.horaLlegada} hs).`
            : `${resultado.nombre} inscripto.`
        )
        cerrar()
        return
      }

      if (resultado.fieldErrors) setFieldErrors(resultado.fieldErrors)
      // Con el id en mano, el error deja de ser un callejón sin salida: el
      // diálogo ofrece acreditar a esa persona sin cerrar ni retipear nada.
      if (resultado.yaInscripto) setYaInscripto(resultado.yaInscripto)
      toast.error(resultado.message)
    })
  }

  function acreditarExistente() {
    if (!yaInscripto) return

    startTransition(async () => {
      const resultado = await marcarAsistenciaHoy(yaInscripto.id)

      if (resultado.ok) {
        toast.success(`Acreditado: ${resultado.nombre} (${resultado.horaLlegada} hs)`)
        cerrar()
      } else {
        toast.error(resultado.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(abierto) => (abierto ? setOpen(true) : cerrar())}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="size-4" />
            Agregar inscripto
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar inscripto</DialogTitle>
          <DialogDescription>
            {esDiaDeEvento
              ? "Para quien llega sin haberse anotado. Queda acreditado de hoy automáticamente."
              : "Hoy no es día de evento, así que solo se crea la inscripción."}{" "}
            No se envía el mail con el QR.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="alta-nombre">Nombre y apellido</Label>
            <Input
              id="alta-nombre"
              value={valores.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.nombre)}
            />
            {fieldErrors.nombre ? (
              <p className="text-sm text-destructive">{fieldErrors.nombre}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alta-email">
              Email <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            {/* Opcional a propósito: la persona está entrando ahora y se acredita
                en el acto, así que el mail no cumple ninguna función acá.
                Exigirlo solo lograba que se inventaran direcciones. */}
            <Input
              id="alta-email"
              type="email"
              placeholder="Dejalo vacío si no lo tenés"
              value={valores.email}
              onChange={(e) => set("email", e.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alta-telefono">Teléfono</Label>
              <Input
                id="alta-telefono"
                type="tel"
                maxLength={13}
                value={valores.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.telefono)}
              />
              {fieldErrors.telefono ? (
                <p className="text-sm text-destructive">{fieldErrors.telefono}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alta-edad">Edad</Label>
              <Input
                id="alta-edad"
                type="number"
                min={12}
                max={99}
                value={valores.edad}
                onChange={(e) => set("edad", e.target.value)}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.edad)}
              />
              {fieldErrors.edad ? (
                <p className="text-sm text-destructive">{fieldErrors.edad}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alta-tipo">Congregación</Label>
            <Select
              value={valores.tipoCongregacion}
              onValueChange={(valor) => set("tipoCongregacion", valor as TipoCongregacion)}
              disabled={isPending}
            >
              <SelectTrigger id="alta-tipo">
                <SelectValue placeholder="Elegí una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vsn">Es de Vida Sobrenatural</SelectItem>
                <SelectItem value="nuevo">Es nuevo (sin congregación)</SelectItem>
                <SelectItem value="otra">Es de otra congregación</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.tipoCongregacion ? (
              <p className="text-sm text-destructive">{fieldErrors.tipoCongregacion}</p>
            ) : null}
          </div>

          {valores.tipoCongregacion === "otra" ? (
            <div className="space-y-2">
              <Label htmlFor="alta-congregacion">¿Cuál?</Label>
              {/* Texto libre con sugerencias, igual que el combobox público: el
                  servidor resuelve el nombre a una FK por `nombreNormalizado`,
                  así que elegir de la lista y tipearla terminan en la misma
                  fila. Un nombre nuevo entra como PENDIENTE para que el admin
                  lo apruebe o lo fusione después. */}
              <Input
                id="alta-congregacion"
                list={datalistId}
                autoComplete="off"
                placeholder="Escribí o elegí una congregación"
                value={valores.congregacionQuery}
                onChange={(e) => set("congregacionQuery", e.target.value)}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.congregacionQuery)}
              />
              <datalist id={datalistId}>
                {congregaciones.map((c) => (
                  <option key={c.id} value={c.nombre} />
                ))}
              </datalist>
              {fieldErrors.congregacionQuery ? (
                <p className="text-sm text-destructive">{fieldErrors.congregacionQuery}</p>
              ) : null}
            </div>
          ) : null}

          {yaInscripto ? (
            <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <p className="text-sm">
                <strong>{yaInscripto.nombre}</strong> ya está anotado con ese email. No hace falta
                cargarlo de nuevo.
              </p>
              <Button
                type="button"
                className="gap-2"
                onClick={acreditarExistente}
                disabled={isPending}
              >
                <UserCheck className="size-4" />
                Acreditar a {yaInscripto.nombre}
              </Button>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrar} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : esDiaDeEvento ? "Inscribir y acreditar" : "Inscribir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
