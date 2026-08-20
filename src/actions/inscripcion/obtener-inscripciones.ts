"use server"

import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guards"
import type { InscripcionDTO } from "@/interfaces/inscripcion"

export async function obtenerInscripciones(): Promise<InscripcionDTO[]> {
  await requireSession()

  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        congregacion: true,
        contacto: {
          select: {
            contactado: true,
            usuario: { select: { nombre: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return inscripciones.map((ins) => ({
      id: ins.id,
      nombre: ins.nombre,
      email: ins.email,
      telefono: ins.telefono,
      edad: ins.edad,
      congregacionId: ins.congregacionId,
      congregacionNombre: ins.congregacion?.nombre || null,
      createdAt: ins.createdAt.toISOString(),
      contactado: ins.contacto?.contactado ?? false,
      contactoUsuarioNombre: ins.contacto?.usuario.nombre ?? null,
    }))
  } catch (error) {
    console.error("Error obteniendo inscripciones:", error)
    return []
  }
}
