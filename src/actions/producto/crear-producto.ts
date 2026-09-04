"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"
import { CrearProductoSchema, type CrearProductoDTO } from "@/interfaces/producto"

export async function crearProducto(data: CrearProductoDTO) {
  try {
    await requireCatalogo()

    const parsed = CrearProductoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const existente = await prisma.producto.findUnique({ where: { slug: parsed.data.slug } })
    if (existente) {
      return { ok: false as const, message: "Ya existe un producto con ese slug." }
    }

    // La categoría solo se puede chequear contra la base (Zod no hace I/O),
    // mirror del chequeo de `recursoId` en `crear-contenido.ts:27-38`. La FK
    // también lo garantiza, pero esta consulta devuelve un mensaje legible en
    // vez de un error de constraint crudo.
    const categoria = await prisma.categoriaProducto.findUnique({
      where: { id: parsed.data.categoriaId },
      select: { id: true },
    })
    if (!categoria) {
      return { ok: false as const, message: "La categoría no existe." }
    }

    const creado = await prisma.producto.create({
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

    revalidatePath("/admin/productos")
    revalidatePath("/productos")
    // Con `generateStaticParams`, un 404 negativo de esta URL —de alguien que
    // la visitó antes de que el producto existiera— queda cacheado.
    revalidatePath(`/productos/${parsed.data.slug}`)
    return { ok: true as const, id: creado.id }
  } catch (error) {
    console.error("Error creando producto:", error)
    return { ok: false as const, message: "No se pudo crear el producto." }
  }
}
