"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"
import { ActualizarContenidoSchema, type ActualizarContenidoDTO } from "@/interfaces/contenido"
import { borrarBlobsSinReferencia } from "@/lib/blob/referencias"

export async function actualizarContenido(data: ActualizarContenidoDTO) {
  try {
    await requireCatalogo()

    const parsed = ActualizarContenidoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const existing = await prisma.contenido.findUnique({
      where: { id: parsed.data.id },
      // Los archivos viejos hacen falta para saber cuáles quedaron huérfanos
      // en Blob después del update.
      include: { archivos: { select: { url: true } } },
    })
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

    // El tipo del recurso apuntado solo se puede chequear contra la base, asi
    // que no puede vivir en `reglasPorTipo` (Zod, sin I/O). Gemelo del bloque
    // en `crear-contenido.ts`: si cambia uno, cambia el otro.
    if (parsed.data.recursoId) {
      const recurso = await prisma.contenido.findUnique({
        where: { id: parsed.data.recursoId },
        select: { tipo: true },
      })
      if (!recurso) {
        return { ok: false as const, message: "El recurso asociado no existe." }
      }
      if (recurso.tipo !== "RECURSOS") {
        return { ok: false as const, message: "El contenido asociado no es un recurso." }
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
        recursoId: parsed.data.recursoId ?? null,
        campo: parsed.data.campo,
        imagenSrc: parsed.data.imagenSrc ?? null,
        imagenCover: parsed.data.imagenCover,
        imagenAtenuada: parsed.data.imagenAtenuada,
        publicado: parsed.data.publicado,
      },
    })

    await borrarBlobsSinReferencia([
      ...existing.archivos.map((archivo) => archivo.url),
      existing.imagenSrc ?? "",
    ])

    revalidatePath("/admin/contenidos")
    revalidatePath("/contenidos")
    revalidatePath(`/contenidos/${existing.slug}`)
    if (slugCambio) {
      revalidatePath(`/contenidos/${parsed.data.slug}`)
    }

    // Vincular o desvincular un recurso lo saca del catálogo o se lo devuelve,
    // así que las dos páginas involucradas (la que dejó de estar y la que
    // entró) quedaron viejas.
    const recursoNuevo = parsed.data.recursoId ?? null
    if (recursoNuevo !== existing.recursoId) {
      const afectados = [existing.recursoId, recursoNuevo].filter(
        (id): id is string => id !== null
      )
      const recursos = await prisma.contenido.findMany({
        where: { id: { in: afectados } },
        select: { slug: true },
      })
      for (const recurso of recursos) {
        revalidatePath(`/contenidos/${recurso.slug}`)
      }
    }

    // Si lo editado ES un recurso, sus archivos son las placas que muestran
    // todas las prédicas que lo apuntan: esas páginas también cambiaron.
    if (existing.tipo === "RECURSOS") {
      const predicas = await prisma.contenido.findMany({
        where: { recursoId: existing.id },
        select: { slug: true },
      })
      for (const predica of predicas) {
        revalidatePath(`/contenidos/${predica.slug}`)
      }
    }

    return { ok: true as const }
  } catch (error) {
    console.error("Error actualizando contenido:", error)
    return { ok: false as const, message: "No se pudo actualizar el contenido." }
  }
}
