"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"
import { ActualizarProductoSchema, type ActualizarProductoDTO } from "@/interfaces/producto"
import { borrarBlobsSinReferencia } from "@/lib/blob/referencias"

export async function actualizarProducto(data: ActualizarProductoDTO) {
  try {
    await requireCatalogo()

    const parsed = ActualizarProductoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const existing = await prisma.producto.findUnique({ where: { id: parsed.data.id } })
    if (!existing) {
      return { ok: false as const, message: "Producto no encontrado." }
    }

    const slugCambio = parsed.data.slug !== existing.slug
    if (slugCambio) {
      const slugTomado = await prisma.producto.findUnique({ where: { slug: parsed.data.slug } })
      if (slugTomado) {
        return { ok: false as const, message: "Ya existe un producto con ese slug." }
      }
    }

    const categoria = await prisma.categoriaProducto.findUnique({
      where: { id: parsed.data.categoriaId },
      select: { id: true },
    })
    if (!categoria) {
      return { ok: false as const, message: "La categoría no existe." }
    }

    await prisma.producto.update({
      where: { id: parsed.data.id },
      data: {
        slug: parsed.data.slug,
        titulo: parsed.data.titulo,
        descripcion: parsed.data.descripcion,
        categoriaId: parsed.data.categoriaId,
        badge: parsed.data.badge,
        imagenSrc: parsed.data.imagenSrc,
        publicado: parsed.data.publicado,
      },
    })

    await borrarBlobsSinReferencia([existing.imagenSrc])

    revalidatePath("/admin/productos")
    revalidatePath("/productos")
    revalidatePath(`/productos/${existing.slug}`)
    if (slugCambio) {
      revalidatePath(`/productos/${parsed.data.slug}`)
    }

    return { ok: true as const }
  } catch (error) {
    console.error("Error actualizando producto:", error)
    return { ok: false as const, message: "No se pudo actualizar el producto." }
  }
}
