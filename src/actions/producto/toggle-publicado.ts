"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"

/** Nombre distinto del gemelo de Contenido (`toggleContenidoPublicado`) para
 *  que el barrel `export *` de `actions/index.ts` no colisione. */
export async function toggleProductoPublicado(id: string) {
  try {
    await requireCatalogo()

    const producto = await prisma.producto.findUnique({ where: { id } })
    if (!producto) {
      return { ok: false as const, message: "Producto no encontrado." }
    }

    await prisma.producto.update({
      where: { id },
      data: { publicado: !producto.publicado },
    })

    revalidatePath("/admin/productos")
    revalidatePath("/productos")
    revalidatePath(`/productos/${producto.slug}`)

    return { ok: true as const, publicado: !producto.publicado }
  } catch (error) {
    console.error("Error actualizando producto:", error)
    return { ok: false as const, message: "No se pudo actualizar el producto." }
  }
}
