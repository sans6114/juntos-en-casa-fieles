"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { crearContenido } from "@/actions"
import type { RecursoVinculable } from "@/actions/contenido/obtener-recursos-vinculables"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { CrearContenidoSchema, type ContenidoArchivoDTO } from "@/interfaces/contenido"

import { ArchivosUploader } from "./archivos-uploader"

type CrearRecursoDialogProps = {
  /** Edición de la prédica en curso: se precarga para no tipearla dos veces. */
  edicion: string
  /** Corre con el recurso ya creado, para vincularlo sin recargar la página. */
  onCreado: (recurso: RecursoVinculable) => void
  disabled?: boolean
}

const ESTADO_INICIAL = {
  slug: "",
  titulo: "",
  descripcion: "",
  publicado: true,
}

/**
 * Crea un RECURSOS sin salir del form de la prédica que se está cargando.
 *
 * Existe porque el orden natural del admin es al revés del orden de los datos:
 * primero escribe la prédica, y recién ahí se acuerda de que las placas todavía
 * no están cargadas. Sin esto tendría que abandonar el form, perder lo tipeado,
 * crear el recurso y volver a empezar.
 *
 * Reusa la acción `crearContenido` y el mismo `ArchivosUploader` del form
 * grande: no hay un segundo camino de alta que pueda divergir del primero.
 *
 * Sigue el precedente de `usuarios-panel.tsx:105` (Dialog con form de alta
 * adentro). Ojo: el kit es `@base-ui/react`, no Radix — el trigger se compone
 * con `render={<Button/>}`, no con `asChild`.
 */
export function CrearRecursoDialog({ edicion, onCreado, disabled }: CrearRecursoDialogProps) {
  const [open, setOpen] = useState(false)
  const [campos, setCampos] = useState(ESTADO_INICIAL)
  const [archivos, setArchivos] = useState<ContenidoArchivoDTO[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setCampos(ESTADO_INICIAL)
    setArchivos([])
    setError(undefined)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(undefined)

    // Un RECURSOS no usa orador, sesión, youtubeId ni duración: el diálogo solo
    // pide lo que ese tipo necesita, y el resto va en sus valores neutros.
    const payload = {
      slug: campos.slug,
      titulo: campos.titulo,
      descripcion: campos.descripcion,
      tipo: "RECURSOS" as const,
      edicion,
      archivos,
      campo: "CAMPO_PAPEL" as const,
      imagenCover: false,
      imagenAtenuada: false,
      publicado: campos.publicado,
    }

    const parsed = CrearContenidoSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos.")
      return
    }

    startTransition(async () => {
      const result = await crearContenido(parsed.data)
      if (!result.ok) {
        setError(result.message ?? "No se pudo crear el recurso.")
        return
      }

      onCreado({
        id: result.id,
        titulo: parsed.data.titulo,
        slug: parsed.data.slug,
        publicado: parsed.data.publicado,
      })
      toast.success("Recurso creado y vinculado")
      reset()
      setOpen(false)
    })
  }

  const bloqueado = isPending || subiendo

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
            Crear recurso
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear recurso</DialogTitle>
          <DialogDescription>
            Se crea un contenido de tipo Recursos y queda vinculado a esta prédica. No va a
            aparecer como card propia en el catálogo.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="recurso-titulo">Título</Label>
            <Input
              id="recurso-titulo"
              placeholder="Ej. Placas de la prédica de apertura"
              value={campos.titulo}
              onChange={(e) => setCampos((c) => ({ ...c, titulo: e.target.value }))}
              required
              disabled={bloqueado}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurso-slug">Slug</Label>
            <Input
              id="recurso-slug"
              placeholder="placas-apertura"
              value={campos.slug}
              onChange={(e) => setCampos((c) => ({ ...c, slug: e.target.value }))}
              required
              disabled={bloqueado}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurso-descripcion">Descripción</Label>
            <Textarea
              id="recurso-descripcion"
              rows={3}
              value={campos.descripcion}
              onChange={(e) => setCampos((c) => ({ ...c, descripcion: e.target.value }))}
              required
              disabled={bloqueado}
            />
          </div>

          <ArchivosUploader
            id="recurso-archivos"
            label="Archivos"
            archivos={archivos}
            onChange={setArchivos}
            onUploadingChange={setSubiendo}
            disabled={isPending}
          />

          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={campos.publicado}
              onCheckedChange={(valor) => setCampos((c) => ({ ...c, publicado: valor === true }))}
              disabled={bloqueado}
            />
            Publicado
          </Label>

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
            <Button type="submit" disabled={bloqueado}>
              {isPending ? "Creando..." : "Crear recurso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
