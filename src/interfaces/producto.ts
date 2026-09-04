import { z } from "zod"
import { esUrlDeBlob, type CampoThumb } from "@/interfaces/contenido"

export type CategoriaProductoDTO = { id: string; slug: string; nombre: string }

export type ProductoPublicoDTO = {
  id: string
  slug: string
  titulo: string
  descripcion: string
  categoriaId: string
  /** Denormalizado por el mapper desde `include: { categoria: true }`: el
   *  front no vuelve a consultar para pintar el kicker. */
  categoriaNombre: string
  badge: string
  /** VISIBLE: es el passepartout alrededor de la foto, no un fondo tapado. */
  campo: CampoThumb
  /** Obligatoria: no hay producto sin foto. */
  imagenSrc: string
}

/** Fila completa tal como la consume el panel de administración. */
export type ProductoAdminDTO = ProductoPublicoDTO & {
  publicado: boolean
  createdAt: string
  updatedAt: string
}

/** Reemplaza al campo `kicker` borrado. Lee el nombre de la categoria, no una
 *  etiqueta de enum: una categoria nueva trae su kicker sin deploy. */
export function kickerDeProducto(categoriaNombre: string): string {
  return `${categoriaNombre} · Juntos En Casa 2026`
}

const productoBase = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo admite minúsculas, números y guiones"),
  titulo: z.string().trim().min(1, "El título es obligatorio"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  categoriaId: z.string().min(1, "Elegí una categoría"),
  badge: z.string().trim().min(1, "El badge es obligatorio"),
  campo: z.enum(["CAMPO_PAPEL", "CAMPO_TINTA", "CAMPO_FUEGO"], "Elegí un campo de fondo"),
  imagenSrc: z
    .string()
    .trim()
    .min(1, "Subí una foto del producto")
    .refine(esUrlDeBlob, "La foto tiene que subirse desde el panel"),
  publicado: z.boolean(),
})

export const CrearProductoSchema = productoBase
export const ActualizarProductoSchema = productoBase.extend({
  id: z.string().min(1, "Falta el id del producto"),
})

export type CrearProductoDTO = z.infer<typeof CrearProductoSchema>
export type ActualizarProductoDTO = z.infer<typeof ActualizarProductoSchema>

export const CrearCategoriaProductoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
})

export type CrearCategoriaProductoDTO = z.infer<typeof CrearCategoriaProductoSchema>
