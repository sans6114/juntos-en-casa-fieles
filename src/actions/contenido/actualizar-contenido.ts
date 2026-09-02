"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { ActualizarContenidoSchema, type ActualizarContenidoDTO } from "@/interfaces/contenido"

export async function actualizarContenido(data: ActualizarContenidoDTO) {
  try {
    await requireAdmin()

    const parsed = ActualizarContenidoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const existing = await prisma.contenido.findUnique({ where: { id: parsed.data.id } })
    if (!existing) {
      return { ok: false as const, message: "Contenido no encontrado." }
    }

    const slugCambio = parsed.data.slug !== existing.slug
    if (slugCambio) {
      const slugTomado = await prisma.contenido.findUnique({ where: { slug: parsed.data.slug } })
      if (slugTomado) {
        return { ok: false as const, message: "Ya existe un contenido con ese slug." }
      }
    }

    await prisma.contenido.update({
      where: { id: parsed.data.id },
      data: {
        slug: parsed.data.slug,
        titulo: parsed.data.titulo,
        descripcion: parsed.data.descripcion,
        tipo: parsed.data.tipo,
        edicion: parsed.data.edicion,
        sesion: parsed.data.sesion ?? null,
        orador: parsed.data.orador ?? null,
        youtubeId: parsed.data.youtubeId ?? null,
        duracion: parsed.data.duracion ?? null,
        // La lista del form es la fuente completa: se reemplaza entera en vez
        // de intentar un diff. `deleteMany` + `create` corren dentro del mismo
        // update, así que Prisma los envuelve en una transacción — nunca queda
        // un contenido con los archivos viejos borrados y los nuevos sin crear.
        archivos: {
          deleteMany: {},
          create: parsed.data.archivos.map((archivo, indice) => ({
            url: archivo.url,
            mime: archivo.mime,
            orden: indice,
            paginas: archivo.paginas ?? null,
          })),
        },
        campo: parsed.data.campo,
        imagenSrc: parsed.data.imagenSrc ?? null,
        imagenCover: parsed.data.imagenCover,
        imagenAtenuada: parsed.data.imagenAtenuada,
        publicado: parsed.data.publicado,
      },
    })

    revalidatePath("/admin/contenidos")
    revalidatePath("/contenidos")
    revalidatePath(`/contenidos/${existing.slug}`)
    if (slugCambio) {
      revalidatePath(`/contenidos/${parsed.data.slug}`)
    }

    return { ok: true as const }
  } catch (error) {
    console.error("Error actualizando contenido:", error)
    return { ok: false as const, message: "No se pudo actualizar el contenido." }
  }
}
