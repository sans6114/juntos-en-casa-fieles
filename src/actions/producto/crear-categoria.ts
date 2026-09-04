"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"
import { CrearCategoriaProductoSchema, type CrearCategoriaProductoDTO } from "@/interfaces/producto"

/**
 * Privada a este módulo: un solo call site, mismo criterio con el que
 * `borrarBlobsSinReferencia` vivía adentro de `actualizar-contenido.ts` antes
 * de D7. NO reusa `normalizarNombreCongregacion()`
 * (`src/lib/congregacion/normalizar.ts`) — esa función es una clave
 * persistida que alimenta `Congregacion.nombreNormalizado @unique`, y su
 * propio comentario dice que cambiar el algoritmo exige una migración de
 * backfill. Importarla acá le pondría un segundo consumidor a una función que
 * no se puede tocar sin migrar una tabla no relacionada, y además le falta el
 * paso no-alfanumérico→guion que un slug necesita. Se copia la técnica, no la
 * función.
 */
function derivarSlug(nombre: string): string {
  return nombre
    .normalize("NFD") // "Indumentaría" -> "Indumentari" + combining mark
    .replace(/[̀-ͯ]/g, "") // saca los diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // todo lo que no sea alfanumérico -> guion
    .replace(/^-+|-+$/g, "") // sin guiones al principio ni al final
}

export async function crearCategoriaProducto(data: CrearCategoriaProductoDTO) {
  try {
    await requireCatalogo()

    const parsed = CrearCategoriaProductoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const slug = derivarSlug(parsed.data.nombre)
    if (!slug) {
      return {
        ok: false as const,
        message: "El nombre necesita al menos una letra o un número.",
      }
    }

    const existente = await prisma.categoriaProducto.findUnique({ where: { slug } })
    if (existente) {
      return { ok: false as const, message: "Ya existe una categoría con ese nombre." }
    }

    const creada = await prisma.categoriaProducto.create({
      data: { slug, nombre: parsed.data.nombre },
    })

    revalidatePath("/admin/productos")
    return { ok: true as const, id: creada.id, slug: creada.slug, nombre: creada.nombre }
  } catch (error) {
    console.error("Error creando categoría:", error)
    return { ok: false as const, message: "No se pudo crear la categoría." }
  }
}
