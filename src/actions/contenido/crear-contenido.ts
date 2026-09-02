"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { CrearContenidoSchema, type CrearContenidoDTO } from "@/interfaces/contenido"

export async function crearContenido(data: CrearContenidoDTO) {
  try {
    await requireAdmin()

    const parsed = CrearContenidoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
    }

    const existing = await prisma.contenido.findUnique({
      where: { slug: parsed.data.slug },
    })
    if (existing) {
      return { ok: false as const, message: "Ya existe un contenido con ese slug." }
    }

    // El tipo del recurso apuntado solo se puede chequear contra la base, asi
    // que no puede vivir en `reglasPorTipo` (Zod, sin I/O). Gemelo del bloque
    // en `actualizar-contenido.ts`: si cambia uno, cambia el otro.
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

    const creado = await prisma.contenido.create({
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
        // Nested create: los archivos nacen junto al contenido, en la misma
        // escritura, así no puede quedar un RECURSOS sin sus placas si algo
        // falla en el medio.
        archivos: {
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

    revalidatePath("/admin/contenidos")
    revalidatePath("/contenidos")
    // Con `generateStaticParams`, un 404 negativo de esta URL —de alguien que
    // la visito antes de que el contenido existiera— queda cacheado. Antes
    // faltar esta linea era inofensivo; ahora no.
    revalidatePath(`/contenidos/${parsed.data.slug}`)
    return { ok: true as const, id: creado.id }
  } catch (error) {
    console.error("Error creando contenido:", error)
    return { ok: false as const, message: "No se pudo crear el contenido." }
  }
}
