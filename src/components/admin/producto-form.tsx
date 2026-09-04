"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import { toast } from "sonner"
import { crearProducto, actualizarProducto } from "@/actions"
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
import { ProductoCardBody } from "@/components/external/productos"
import { cayento, helveticaNeue, helveticaNeueCondensed } from "@/config/fonts"
import type { CampoThumb } from "@/interfaces/contenido"
import {
  ActualizarProductoSchema,
  CrearProductoSchema,
  type CategoriaProductoDTO,
  type ProductoAdminDTO,
  type ProductoPublicoDTO,
} from "@/interfaces/producto"
import { optimizarThumb } from "@/lib/image/optimizar-thumb"

import { CrearCategoriaDialog } from "./crear-categoria-dialog"

type ProductoFormProps = {
  /** Presente en modo edición; ausente en modo creación. */
  initialData?: ProductoAdminDTO
  /** Categorías resueltas por la página server. */
  categorias: CategoriaProductoDTO[]
}

type ProductoFormState = {
  slug: string
  titulo: string
  descripcion: string
  categoriaId: string
  badge: string
  campo: CampoThumb
  imagenSrc: string
  publicado: boolean
}

const CAMPO_OPCIONES: { value: CampoThumb; label: string }[] = [
  { value: "CAMPO_PAPEL", label: "Campo papel" },
  { value: "CAMPO_TINTA", label: "Campo tinta" },
  { value: "CAMPO_FUEGO", label: "Campo fuego" },
]

function toFormState(data?: ProductoAdminDTO): ProductoFormState {
  return {
    slug: data?.slug ?? "",
    titulo: data?.titulo ?? "",
    descripcion: data?.descripcion ?? "",
    categoriaId: data?.categoriaId ?? "",
    badge: data?.badge ?? "",
    campo: data?.campo ?? "CAMPO_PAPEL",
    imagenSrc: data?.imagenSrc ?? "",
    publicado: data?.publicado ?? false,
  }
}

/**
 * Arma el `ProductoPublicoDTO` que consume `ProductoCardBody` a partir del
 * estado en progreso del form — mismo patrón que `formToVista` en
 * `contenido-form.tsx`, para que la vista previa use el componente real de
 * la card sin ningún adaptador ni cast (Fase 8 ya lo dejó tipado al DTO).
 */
function formToVista(form: ProductoFormState, categorias: CategoriaProductoDTO[]): ProductoPublicoDTO {
  const categoria = categorias.find((c) => c.id === form.categoriaId)
  return {
    id: "preview",
    slug: form.slug || "preview",
    titulo: form.titulo || "Título del producto",
    descripcion: form.descripcion,
    categoriaId: form.categoriaId,
    categoriaNombre: categoria?.nombre ?? "Categoría",
    badge: form.badge,
    campo: form.campo,
    imagenSrc: form.imagenSrc,
  }
}

export function ProductoForm({ initialData, categorias }: ProductoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ProductoFormState>(() => toFormState(initialData))
  const [errores, setErrores] = useState<Partial<Record<string, string>>>({})
  const [isPending, startTransition] = useTransition()
  const [isUploadingFoto, setIsUploadingFoto] = useState(false)
  // La lista arranca en lo que resolvió la página server, pero crece cuando el
  // admin crea una categoría desde el diálogo sin recargar.
  const [categoriasDisponibles, setCategoriasDisponibles] = useState(categorias)

  const set = <K extends keyof ProductoFormState>(key: K, value: ProductoFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleFotoFile = async (file: File | undefined) => {
    if (!file) return

    setIsUploadingFoto(true)
    try {
      const optimizada = await optimizarThumb(file)

      const { url } = await upload(optimizada.name, optimizada, {
        access: "public",
        handleUploadUrl: "/api/producto/thumb-upload",
      })

      setForm((f) => ({ ...f, imagenSrc: url }))
      toast.success("Foto cargada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la foto")
    } finally {
      setIsUploadingFoto(false)
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
      categoriaId: form.categoriaId,
      badge: form.badge,
      campo: form.campo,
      imagenSrc: form.imagenSrc,
      publicado: form.publicado,
    }

    if (initialData) {
      const parsed = ActualizarProductoSchema.safeParse({ ...payload, id: initialData.id })
      if (!parsed.success) {
        applyIssues(parsed.error.issues)
        toast.error("Revisá los campos marcados")
        return
      }
      setErrores({})
      startTransition(async () => {
        const result = await actualizarProducto(parsed.data)
        if (result.ok) {
          toast.success("Producto actualizado")
          router.push("/admin/productos")
        } else {
          toast.error(result.message ?? "No se pudo guardar")
        }
      })
      return
    }

    const parsed = CrearProductoSchema.safeParse(payload)
    if (!parsed.success) {
      applyIssues(parsed.error.issues)
      toast.error("Revisá los campos marcados")
      return
    }
    setErrores({})
    startTransition(async () => {
      const result = await crearProducto(parsed.data)
      if (result.ok) {
        toast.success("Producto creado")
        router.push("/admin/productos")
      } else {
        toast.error(result.message ?? "No se pudo guardar")
      }
    })
  }

  const submitDeshabilitado =
    isPending || isUploadingFoto || !form.categoriaId || !form.imagenSrc

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
            placeholder="ej. remera-jec-2026"
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

        <div className="space-y-2">
          <Label htmlFor="categoriaId">Categoría</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={form.categoriaId}
              onValueChange={(value) => set("categoriaId", (value as string) ?? "")}
              disabled={isPending}
            >
              <SelectTrigger id="categoriaId" className="min-w-0 flex-1">
                {/* Sin children, `Select.Value` de Base UI renderiza el valor
                    crudo — o sea el cuid de la categoria. El label se resuelve
                    con la forma de funcion. */}
                <SelectValue placeholder="Elegí una categoría">
                  {(value) =>
                    categoriasDisponibles.find((categoria) => categoria.id === value)?.nombre ??
                    "Elegí una categoría"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categoriasDisponibles.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CrearCategoriaDialog
              disabled={isPending}
              onCreado={(categoria) => {
                setCategoriasDisponibles((actuales) => [categoria, ...actuales])
                set("categoriaId", categoria.id)
              }}
            />
          </div>
          {errores.categoriaId ? (
            <p className="text-sm text-destructive">{errores.categoriaId}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge">Badge</Label>
          <Input
            id="badge"
            placeholder="ej. Remera"
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            required
            disabled={isPending}
          />
          {errores.badge ? <p className="text-sm text-destructive">{errores.badge}</p> : null}
        </div>

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
            <Label htmlFor="imagenSrc">Foto</Label>
            <Input
              id="imagenSrc"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                void handleFotoFile(e.target.files?.[0])
              }}
              disabled={isPending || isUploadingFoto}
              required={!form.imagenSrc}
            />
            {isUploadingFoto ? (
              <p className="text-sm text-muted-foreground">Subiendo foto...</p>
            ) : form.imagenSrc ? (
              <p className="text-sm text-muted-foreground">
                Foto cargada — se ve en la vista previa
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Obligatoria. Se reduce a 1280 px antes de subirse.
              </p>
            )}
            {errores.imagenSrc ? (
              <p className="text-sm text-destructive">{errores.imagenSrc}</p>
            ) : null}
          </div>
        </div>

        <Label className="flex items-center gap-2 font-normal">
          <Checkbox
            checked={form.publicado}
            onCheckedChange={(checked) => set("publicado", checked === true)}
            disabled={isPending}
          />
          Publicado
        </Label>

        {/* Bloqueado también durante la subida: guardar con un upload en vuelo
            descartaba el archivo, porque su URL todavía no había entrado al estado. */}
        <Button type="submit" disabled={submitDeshabilitado}>
          {isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Así se va a ver</p>

          {/*
            Mismo wrapper que `contenido-form.tsx`: `.jec-landing` vive en un
            único elemento del repo ((external)/layout.tsx:29) y ahí están
            `--regla`, `.campo-*`, `.jec-label` y `.jec-placeholder`. El admin
            corre bajo `.admin-shell`, aislado a propósito de esos tokens.
          */}
          <div
            className={`jec-landing ${cayento.variable} ${helveticaNeue.variable} ${helveticaNeueCondensed.variable} campo-papel flex flex-col overflow-hidden rounded-[6px] border border-[var(--linea)]`}
          >
            <ProductoCardBody item={formToVista(form, categoriasDisponibles)} />
          </div>
        </div>
      </aside>
    </form>
  )
}
