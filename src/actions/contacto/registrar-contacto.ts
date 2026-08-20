"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guards"
import { RegistrarContactoSchema, type RegistrarContactoDTO } from "@/interfaces/contacto"

export async function registrarContacto(data: RegistrarContactoDTO) {
  const user = await requireSession()

  try {
    const parsed = RegistrarContactoSchema.safeParse(data)
    if (!parsed.success) {
      return { ok: false as const, message: "Datos inválidos." }
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: parsed.data.inscripcionId },
    })

    if (!inscripcion) {
      return { ok: false as const, message: "Inscripción no encontrada." }
    }

    if (inscripcion.congregacionId !== null) {
      return {
        ok: false as const,
        message: "Solo se pueden contactar inscripciones sin iglesia asignada.",
      }
    }

    if (user.rol === "COLABORADOR" && !user.id) {
      return { ok: false as const, message: "No autorizado." }
    }

    const contactadoAt = parsed.data.contactado ? new Date() : null

    await prisma.contacto.upsert({
      where: { inscripcionId: parsed.data.inscripcionId },
      create: {
        inscripcionId: parsed.data.inscripcionId,
        usuarioId: user.id,
        contactado: parsed.data.contactado,
        observacion: parsed.data.observacion ?? null,
        contactadoAt,
      },
      update: {
        usuarioId: user.id,
        contactado: parsed.data.contactado,
        observacion: parsed.data.observacion ?? null,
        contactadoAt: parsed.data.contactado ? new Date() : null,
      },
    })

    revalidatePath(`/admin/inscripciones/${parsed.data.inscripcionId}`)
    revalidatePath("/admin/inscripciones/grilla")
    revalidatePath("/admin/contacto")

    return { ok: true as const }
  } catch (error) {
    console.error("Error registrando contacto:", error)
    return { ok: false as const, message: "No se pudo guardar el contacto." }
  }
}
