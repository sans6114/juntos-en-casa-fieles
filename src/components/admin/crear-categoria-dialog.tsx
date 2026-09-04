"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { crearCategoriaProducto } from "@/actions"
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
import { CrearCategoriaProductoSchema, type CategoriaProductoDTO } from "@/interfaces/producto"

type CrearCategoriaDialogProps = {
  /** Corre con la categoría ya creada, para seleccionarla sin recargar. */
  onCreado: (categoria: CategoriaProductoDTO) => void
  disabled?: boolean
}

const ESTADO_INICIAL = { nombre: "" }

/**
 * Crea una `CategoriaProducto` sin salir del form de producto que se está
 * cargando. Mirror del mecanismo de `crear-recurso-dialog.tsx` (commit
 * `feabbce`) — mismo Dialog `@base-ui/react` con `render={<Button/>}` (NUNCA
 * `asChild`), misma validación cliente antes de la transición, mismo
 * `onCreado` que antepone y selecciona sin recargar.
 *
 * Diferencia deliberada (design D15): NO pide slug. La derivación es
 * server-side (`derivarSlug` en `crear-categoria.ts`) — a diferencia del
 * slug de un recurso, el de una categoría no tiene consumidor público hoy.
 */
export function CrearCategoriaDialog({ onCreado, disabled }: CrearCategoriaDialogProps) {
  const [open, setOpen] = useState(false)
  const [campos, setCampos] = useState(ESTADO_INICIAL)
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setCampos(ESTADO_INICIAL)
    setError(undefined)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(undefined)

    const parsed = CrearCategoriaProductoSchema.safeParse(campos)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos.")
      return
    }

    startTransition(async () => {
      const result = await crearCategoriaProducto(parsed.data)
      if (!result.ok) {
        setError(result.message ?? "No se pudo crear la categoría.")
        return
      }

      onCreado({ id: result.id, slug: result.slug, nombre: result.nombre })
      toast.success("Categoría creada y seleccionada")
      reset()
      setOpen(false)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(abierto) => {
        setOpen(abierto)
        if (!abierto) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="gap-2" disabled={disabled}>
            <Plus className="size-4" />
            Crear categoría
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear categoría</DialogTitle>
          <DialogDescription>
            Se crea una categoría nueva y queda seleccionada en este producto. No hace falta
            elegir un slug: se genera solo a partir del nombre.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="categoria-nombre">Nombre</Label>
            <Input
              id="categoria-nombre"
              placeholder="Ej. Indumentaria"
              value={campos.nombre}
              onChange={(e) => setCampos({ nombre: e.target.value })}
              required
              disabled={isPending}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
