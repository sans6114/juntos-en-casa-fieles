import type { CategoriaProducto, Producto } from "../../../generated/client"
import type { ProductoAdminDTO, ProductoPublicoDTO } from "@/interfaces/producto"

/** La fila tal como la leen las acciones: siempre con su categoría incluida. */
export type ProductoConCategoria = Producto & { categoria: CategoriaProducto }

export function toProductoPublicoDTO(row: ProductoConCategoria): ProductoPublicoDTO {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    descripcion: row.descripcion,
    categoriaId: row.categoriaId,
    categoriaNombre: row.categoria.nombre,
    badge: row.badge,
    campo: row.campo,
    imagenSrc: row.imagenSrc,
  }
}

export function toProductoAdminDTO(row: ProductoConCategoria): ProductoAdminDTO {
  return {
    ...toProductoPublicoDTO(row),
    publicado: row.publicado,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
