"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { crearContenido, actualizarContenido } from "@/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ActualizarContenidoSchema,
  CrearContenidoSchema,
  TIPO_A_KIND,
  kindLabel,
  type CampoThumb,
  type ContenidoAdminDTO,
  type TipoContenido,
} from "@/interfaces/contenido"
import { CONTENIDO_THUMB_ASSETS } from "@/lib/contenido-thumb-assets"

type ContenidoFormProps = {
  /** Presente en modo edición; ausente en modo creación. */
  initialData?: ContenidoAdminDTO
}

type ContenidoFormState = {
  slug: string
  titulo: string
  descripcion: string
  tipo: TipoContenido
  edicion: string
  sesion: string
  orador: string
  youtubeId: string
  duracion: string
  placasUrl: string
  /** Nunca se tipea a mano: se deriva del PDF antes de subirlo. */
  placasCount: number | undefined
  campo: CampoThumb
  imagenSrc: string
  imagenCover: boolean
  imagenAtenuada: boolean
  publicado: boolean
}

type Visibilidad = "requerido" | "opcional" | "oculto"

/**
 * Un renglón por campo condicional, uno por tipo. Refleja línea a línea las
 * reglas de `reglasPorTipo` en `interfaces/contenido.ts` (D13), así un
 * revisor puede chequearlas una contra la otra.
 */
const CAMPOS_POR_TIPO: Record<
  TipoContenido,
  {
    orador: Visibilidad
    sesion: Visibilidad
    youtubeId: Visibilidad
    duracion: Visibilidad
    placas: Visibilidad
  }
> = {
  PREDICA: {
    orador: "requerido",
    sesion: "opcional",
    youtubeId: "opcional",
    duracion: "opcional",
    placas: "oculto",
  },
  VIDEO: {
    orador: "opcional",
    sesion: "opcional",
    youtubeId: "requerido",
    duracion: "opcional",
    placas: "oculto",
  },
  RECURSOS: {
    orador: "oculto",
    sesion: "oculto",
    youtubeId: "oculto",
    duracion: "oculto",
    placas: "requerido",
  },
}

const TIPO_OPCIONES: { value: TipoContenido; label: string }[] = [
  { value: "PREDICA", label: kindLabel(TIPO_A_KIND.PREDICA) },
  { value: "VIDEO", label: kindLabel(TIPO_A_KIND.VIDEO) },
  { value: "RECURSOS", label: kindLabel(TIPO_A_KIND.RECURSOS) },
]

const CAMPO_OPCIONES: { value: CampoThumb; label: string }[] = [
  { value: "CAMPO_PAPEL", label: "Campo papel" },
  { value: "CAMPO_TINTA", label: "Campo tinta" },
  { value: "CAMPO_FUEGO", label: "Campo fuego" },
]

function toFormState(data?: ContenidoAdminDTO): ContenidoFormState {
  return {
    slug: data?.slug ?? "",
    titulo: data?.titulo ?? "",
    descripcion: data?.descripcion ?? "",
    tipo: data?.tipo ?? "PREDICA",
    edicion: data ? String(data.edicion) : "",
    sesion: data?.sesion ?? "",
    orador: data?.orador ?? "",
    youtubeId: data?.youtubeId ?? "",
    duracion: data?.duracion ?? "",
    placasUrl: data?.placasUrl ?? "",
    placasCount: data?.placasCount,
    campo: data?.campo ?? "CAMPO_PAPEL",
    imagenSrc: data?.imagenSrc ?? "",
    imagenCover: data?.imagenCover ?? false,
    imagenAtenuada: data?.imagenAtenuada ?? false,
    publicado: data?.publicado ?? true,
  }
}

export function ContenidoForm({ initialData }: ContenidoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ContenidoFormState>(() => toFormState(initialData))
  const [errores, setErrores] = useState<Partial<Record<string, string>>>({})
  const [isPending, startTransition] = useTransition()

  const campos = CAMPOS_POR_TIPO[form.tipo]

  const set = <K extends keyof ContenidoFormState>(key: K, value: ContenidoFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleTipoChange = (tipo: TipoContenido) => {
    const siguientes = CAMPOS_POR_TIPO[tipo]
    setForm((f) => ({
      ...f,
      tipo,
      // Un campo que pasa a "oculto" se limpia acá mismo: si no, un
      // youtubeId tipeado mientras era VIDEO quedaría guardado en un
      // RECURSOS sin que nadie lo vea.
      orador: siguientes.orador === "oculto" ? "" : f.orador,
      sesion: siguientes.sesion === "oculto" ? "" : f.sesion,
      youtubeId: siguientes.youtubeId === "oculto" ? "" : f.youtubeId,
      duracion: siguientes.duracion === "oculto" ? "" : f.duracion,
      placasUrl: siguientes.placas === "oculto" ? "" : f.placasUrl,
      placasCount: siguientes.placas === "oculto" ? undefined : f.placasCount,
    }))
  }

  const applyIssues = (issues: readonly { path: PropertyKey[]; message: string }[]) => {
    const next: Partial<Record<string, string>> = {}
    for (const issue of issues) {
      const key = issue.path[0]
      if (typeof key === "string" && !(key in next)) {
        next[key] = issue.message
      }
    }
    setErrores(next)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const payload = {
      slug: form.slug,
      titulo: form.titulo,
      descripcion: form.descripcion,
      tipo: form.tipo,
      edicion: form.edicion,
      sesion: form.sesion,
      orador: form.orador,
      youtubeId: form.youtubeId,
      duracion: form.duracion,
      placasUrl: form.placasUrl,
      placasCount: form.placasCount,
      campo: form.campo,
      imagenSrc: form.imagenSrc || undefined,
      imagenCover: form.imagenCover,
      imagenAtenuada: form.imagenAtenuada,
      publicado: form.publicado,
    }

    if (initialData) {
      const parsed = ActualizarContenidoSchema.safeParse({ ...payload, id: initialData.id })
      if (!parsed.success) {
        applyIssues(parsed.error.issues)
        toast.error("Revisá los campos marcados")
        return
      }
      setErrores({})
      startTransition(async () => {
        const result = await actualizarContenido(parsed.data)
        if (result.ok) {
          toast.success("Contenido actualizado")
          router.push("/admin/contenidos")
        } else {
          toast.error(result.message ?? "No se pudo guardar")
        }
      })
      return
    }

    const parsed = CrearContenidoSchema.safeParse(payload)
    if (!parsed.success) {
      applyIssues(parsed.error.issues)
      toast.error("Revisá los campos marcados")
      return
    }
    setErrores({})
    startTransition(async () => {
      const result = await crearContenido(parsed.data)
      if (result.ok) {
        toast.success("Contenido creado")
        router.push("/admin/contenidos")
      } else {
        toast.error(result.message ?? "No se pudo guardar")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            required
            disabled={isPending}
          />
          {errores.titulo ? <p className="text-sm text-destructive">{errores.titulo}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="ej. anclados-en-la-roca"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
            disabled={isPending}
          />
          {errores.slug ? <p className="text-sm text-destructive">{errores.slug}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            required
            disabled={isPending}
          />
          {errores.descripcion ? (
            <p className="text-sm text-destructive">{errores.descripcion}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(value) => handleTipoChange(value as TipoContenido)}
              disabled={isPending}
            >
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPCIONES.map((opcion) => (
                  <SelectItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errores.tipo ? <p className="text-sm text-destructive">{errores.tipo}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edicion">Edición</Label>
            <Input
              id="edicion"
              type="number"
              value={form.edicion}
              onChange={(e) => set("edicion", e.target.value)}
              required
              disabled={isPending}
            />
            {errores.edicion ? (
              <p className="text-sm text-destructive">{errores.edicion}</p>
            ) : null}
          </div>
        </div>

        {campos.sesion !== "oculto" ? (
          <div className="space-y-2">
            <Label htmlFor="sesion">
              Sesión {campos.sesion === "opcional" ? "(opcional)" : null}
            </Label>
            <Input
              id="sesion"
              placeholder="ej. Apertura · Viernes"
              value={form.sesion}
              onChange={(e) => set("sesion", e.target.value)}
              disabled={isPending}
            />
            {errores.sesion ? <p className="text-sm text-destructive">{errores.sesion}</p> : null}
          </div>
        ) : null}

        {campos.orador !== "oculto" ? (
          <div className="space-y-2">
            <Label htmlFor="orador">
              Orador {campos.orador === "opcional" ? "(opcional)" : null}
            </Label>
            <Input
              id="orador"
              value={form.orador}
              onChange={(e) => set("orador", e.target.value)}
              required={campos.orador === "requerido"}
              disabled={isPending}
            />
            {errores.orador ? <p className="text-sm text-destructive">{errores.orador}</p> : null}
          </div>
        ) : null}

        {campos.youtubeId !== "oculto" ? (
          <div className="space-y-2">
            <Label htmlFor="youtubeId">
              Id de YouTube {campos.youtubeId === "opcional" ? "(opcional)" : null}
            </Label>
            <Input
              id="youtubeId"
              placeholder="Pegá solo el id, no la URL completa"
              value={form.youtubeId}
              onChange={(e) => set("youtubeId", e.target.value)}
              required={campos.youtubeId === "requerido"}
              disabled={isPending}
            />
            {errores.youtubeId ? (
              <p className="text-sm text-destructive">{errores.youtubeId}</p>
            ) : null}
          </div>
        ) : null}

        {campos.duracion !== "oculto" ? (
          <div className="space-y-2">
            <Label htmlFor="duracion">
              Duración {campos.duracion === "opcional" ? "(opcional)" : null}
            </Label>
            <Input
              id="duracion"
              placeholder="ej. 48:12"
              value={form.duracion}
              onChange={(e) => set("duracion", e.target.value)}
              disabled={isPending}
            />
            {errores.duracion ? (
              <p className="text-sm text-destructive">{errores.duracion}</p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="campo">Campo de fondo</Label>
            <Select
              value={form.campo}
              onValueChange={(value) => set("campo", value as CampoThumb)}
              disabled={isPending}
            >
              <SelectTrigger id="campo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPO_OPCIONES.map((opcion) => (
                  <SelectItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errores.campo ? <p className="text-sm text-destructive">{errores.campo}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagenSrc">Thumbnail (opcional)</Label>
            <Select
              value={form.imagenSrc || undefined}
              onValueChange={(value) => set("imagenSrc", (value as string) ?? "")}
              disabled={isPending}
            >
              <SelectTrigger id="imagenSrc" className="w-full">
                <SelectValue placeholder="Sin imagen" />
              </SelectTrigger>
              <SelectContent>
                {CONTENIDO_THUMB_ASSETS.map((asset) => (
                  <SelectItem key={asset.value} value={asset.value}>
                    {asset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errores.imagenSrc ? (
              <p className="text-sm text-destructive">{errores.imagenSrc}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={form.imagenCover}
              onCheckedChange={(checked) => set("imagenCover", checked === true)}
              disabled={isPending}
            />
            Imagen cubre el marco
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={form.imagenAtenuada}
              onCheckedChange={(checked) => set("imagenAtenuada", checked === true)}
              disabled={isPending}
            />
            Imagen atenuada
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={form.publicado}
              onCheckedChange={(checked) => set("publicado", checked === true)}
              disabled={isPending}
            />
            Publicado
          </Label>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Crear contenido"}
        </Button>
      </div>
    </form>
  )
}
