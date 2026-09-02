"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
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
import { ContenidoCardBody } from "@/components/external/contenidos"
import { cayento, helveticaNeue, helveticaNeueCondensed } from "@/config/fonts"
import {
  ActualizarContenidoSchema,
  CAMPO_A_CLASE,
  CrearContenidoSchema,
  MIMES_ARCHIVO,
  TIPO_A_KIND,
  contarPlacas,
  kindLabel,
  type CampoThumb,
  type ContenidoAdminDTO,
  type ContenidoArchivoDTO,
  type ContenidoVista,
  type TipoContenido,
} from "@/interfaces/contenido"
import { optimizarThumb } from "@/lib/image/optimizar-thumb"

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
  /**
   * Los archivos ya subidos a Blob, en el orden en que los ve el público. El
   * conteo de placas NO vive acá: se deriva con `contarPlacas`.
   */
  archivos: ContenidoArchivoDTO[]
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

/**
 * `orden` es la posición en la lista, no un número que alguien elija. Se
 * recalcula después de cada agregado, quitado o movimiento para que nunca
 * queden huecos ni empates — el servidor vuelve a hacer lo mismo al guardar.
 */
function reordenar(archivos: ContenidoArchivoDTO[]): ContenidoArchivoDTO[] {
  return archivos.map((archivo, indice) => ({ ...archivo, orden: indice }))
}

/** Nombre legible de un archivo subido: el último tramo de la URL de Blob. */
function nombreDeArchivo(url: string): string {
  return decodeURIComponent(url.split("/").pop() ?? url)
}

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
    archivos: data?.archivos ?? [],
    campo: data?.campo ?? "CAMPO_PAPEL",
    imagenSrc: data?.imagenSrc ?? "",
    imagenCover: data?.imagenCover ?? false,
    imagenAtenuada: data?.imagenAtenuada ?? false,
    publicado: data?.publicado ?? true,
  }
}

/**
 * Helper local (design §7.1): arma el `ContenidoVista` que consume
 * `ContenidoCardBody` a partir del estado en progreso del form, usando los
 * mismos mapas (`TIPO_A_KIND`, `CAMPO_A_CLASE`) que usa el mapper
 * server-side — así el DTO real y el estado del form comparten un único
 * componente de preview sin ningún cast.
 */
function formToVista(form: ContenidoFormState): ContenidoVista {
  return {
    title: form.titulo || "Título del contenido",
    description: form.descripcion,
    kind: TIPO_A_KIND[form.tipo],
    thumb: {
      field: CAMPO_A_CLASE[form.campo],
      src: form.imagenSrc || undefined,
      fit: form.imagenCover ? "cover" : "contain",
      dim: form.imagenAtenuada,
    },
    session: form.sesion || undefined,
    speaker: form.orador || undefined,
    durationLabel: form.duracion || undefined,
    placasCount: contarPlacas(form.archivos),
  }
}

export function ContenidoForm({ initialData }: ContenidoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ContenidoFormState>(() => toFormState(initialData))
  const [errores, setErrores] = useState<Partial<Record<string, string>>>({})
  const [isPending, startTransition] = useTransition()
  const [isUploadingPlacas, setIsUploadingPlacas] = useState(false)
  const [isUploadingThumb, setIsUploadingThumb] = useState(false)

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
      archivos: siguientes.placas === "oculto" ? [] : f.archivos,
    }))
  }

  /**
   * Sube N archivos y los AGREGA a los que ya estaban — el admin puede cargar
   * el PDF en una tanda y los fondos de pantalla en otra.
   *
   * Cada archivo se maneja por separado: uno que falla no se lleva puestos a
   * los que ya subieron. Por eso el `try` está adentro del loop y no afuera.
   *
   * Las páginas se cuentan solo para PDF, en el browser y ANTES de subir, para
   * que un archivo corrupto avise antes del paso de red lento. Un conteo
   * fallido NO bloquea la subida: `reglasPorTipo` exige que haya archivos, no
   * que sepamos cuántas páginas tienen.
   */
  const handleArchivosFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploadingPlacas(true)
    const subidos: ContenidoArchivoDTO[] = []

    for (const file of Array.from(files)) {
      if (!(MIMES_ARCHIVO as readonly string[]).includes(file.type)) {
        toast.error(`"${file.name}" no es un PDF ni una imagen`)
        continue
      }
      const mime = file.type as ContenidoArchivoDTO["mime"]

      try {
        let paginas: number | undefined
        if (mime === "application/pdf") {
          try {
            const bytes = await file.arrayBuffer()
            const { PDFDocument } = await import("pdf-lib")
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
            paginas = doc.getPageCount()
          } catch {
            toast.error(`No pudimos leer la cantidad de páginas de "${file.name}"`)
          }
        }

        const { url } = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/contenido/placas-upload",
        })

        // `orden` se reasigna al final contra la lista completa.
        subidos.push({ url, mime, orden: 0, paginas })
      } catch (error) {
        toast.error(
          error instanceof Error ? `"${file.name}": ${error.message}` : `No se pudo subir "${file.name}"`
        )
      }
    }

    setIsUploadingPlacas(false)
    if (subidos.length === 0) return

    setForm((f) => ({ ...f, archivos: reordenar([...f.archivos, ...subidos]) }))
    toast.success(subidos.length === 1 ? "Archivo cargado" : `${subidos.length} archivos cargados`)
  }

  const quitarArchivo = (indice: number) => {
    setForm((f) => ({ ...f, archivos: reordenar(f.archivos.filter((_, i) => i !== indice)) }))
  }

  const moverArchivo = (indice: number, direccion: -1 | 1) => {
    const destino = indice + direccion
    setForm((f) => {
      if (destino < 0 || destino >= f.archivos.length) return f
      const siguiente = [...f.archivos]
      const [movido] = siguiente.splice(indice, 1)
      siguiente.splice(destino, 0, movido)
      return { ...f, archivos: reordenar(siguiente) }
    })
  }

  /**
   * Mismo orden que `handlePlacasFile`: trabajo local primero, red después.
   * A diferencia de placas, acá un fallo de la etapa local SÍ aborta — sin el
   * WebP convertido no hay nada que subir, mientras que un conteo de páginas
   * fallido deja igual un PDF válido.
   */
  const handleThumbFile = async (file: File | undefined) => {
    if (!file) return

    setIsUploadingThumb(true)
    try {
      const optimizada = await optimizarThumb(file)

      const { url } = await upload(optimizada.name, optimizada, {
        access: "public",
        handleUploadUrl: "/api/contenido/thumb-upload",
      })

      setForm((f) => ({ ...f, imagenSrc: url }))
      toast.success("Miniatura cargada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la miniatura")
    } finally {
      setIsUploadingThumb(false)
    }
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
      archivos: form.archivos,
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

        {campos.placas !== "oculto" ? (
          <div className="space-y-2">
            <Label htmlFor="placas">
              Archivos {campos.placas === "opcional" ? "(opcional)" : null}
            </Label>
            <Input
              id="placas"
              type="file"
              multiple
              accept={MIMES_ARCHIVO.join(",")}
              onChange={(e) => {
                void handleArchivosFiles(e.target.files)
                // El input se limpia para que volver a elegir el mismo archivo
                // dispare `change` de nuevo: sin esto, quitarlo de la lista y
                // re-agregarlo no funcionaría.
                e.target.value = ""
              }}
              disabled={isPending || isUploadingPlacas}
            />

            {isUploadingPlacas ? (
              <p className="text-sm text-muted-foreground">Subiendo archivos...</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                PDF de placas e imágenes sueltas (fondos de pantalla). Se suben sin recomprimir.
              </p>
            )}

            {form.archivos.length > 0 ? (
              <ul className="divide-y rounded-md border">
                {form.archivos.map((archivo, indice) => (
                  <li key={archivo.url} className="flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm" title={archivo.url}>
                      {nombreDeArchivo(archivo.url)}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {archivo.paginas ? `${archivo.paginas} pág.` : "imagen"}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Subir ${nombreDeArchivo(archivo.url)} un lugar`}
                        onClick={() => moverArchivo(indice, -1)}
                        disabled={isPending || indice === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Bajar ${nombreDeArchivo(archivo.url)} un lugar`}
                        onClick={() => moverArchivo(indice, 1)}
                        disabled={isPending || indice === form.archivos.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Quitar ${nombreDeArchivo(archivo.url)}`}
                        onClick={() => quitarArchivo(indice)}
                        disabled={isPending}
                      >
                        Quitar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {errores.archivos ? (
              <p className="text-sm text-destructive">{errores.archivos}</p>
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
            <Label htmlFor="imagenSrc">Miniatura (opcional)</Label>
            <Input
              id="imagenSrc"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                void handleThumbFile(e.target.files?.[0])
              }}
              disabled={isPending || isUploadingThumb}
            />
            {isUploadingThumb ? (
              <p className="text-sm text-muted-foreground">Subiendo miniatura...</p>
            ) : form.imagenSrc ? (
              <p className="text-sm text-muted-foreground">
                Imagen cargada — se ve en la vista previa
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Se reduce a 1280 px antes de subirse. El campo de fondo se usa si no cargás ninguna.
              </p>
            )}
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

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Así se va a ver</p>

          {/*
            CRÍTICO (corrección 3, design-findings #144): sin este wrapper la
            preview se renderiza sin estilos. `.jec-landing` se aplica en un
            único elemento de todo el repo ((external)/layout.tsx:29) y ahí
            viven `--regla`, `.campo-*`, `.jec-label` y `.jec-placeholder`
            (globals.css). El admin corre bajo `.admin-shell`, aislado a
            propósito de los tokens públicos.
          */}
          <div
            className={`jec-landing ${cayento.variable} ${helveticaNeue.variable} ${helveticaNeueCondensed.variable} campo-papel flex flex-col overflow-hidden rounded-[6px] border border-[var(--linea)]`}
          >
            <ContenidoCardBody item={formToVista(form)} />
          </div>

          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Edición: {form.edicion || "—"}</li>
            <li>Duración: {form.duracion || "—"}</li>
            <li>YouTube: {form.youtubeId ? "cargado" : "sin cargar"}</li>
            <li>
              Placas:{" "}
              {form.archivos.length > 0
                ? `${form.archivos.length} ${form.archivos.length === 1 ? "archivo" : "archivos"}`
                : "sin cargar"}
            </li>
          </ul>
        </div>
      </aside>
    </form>
  )
}
