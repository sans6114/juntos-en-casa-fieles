"use server"

import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guards"
import { esCandidatoPastoral } from "@/lib/contacto/es-candidato-pastoral"
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
      // Sin FK cae al texto libre legacy, para que una fila anterior a la
      // normalizacion no aparezca como "Sin congregacion".
      congregacionNombre: ins.congregacion?.nombre || ins.congregacionTexto || null,
      congregacionEstado: ins.congregacion?.estado ?? null,
      puedeContactar: esCandidatoPastoral(ins),
      createdAt: ins.createdAt.toISOString(),
      contactado: ins.contacto?.contactado ?? false,
      contactoUsuarioNombre: ins.contacto?.usuario.nombre ?? null,
    }))
  } catch (error) {
    console.error("Error obteniendo inscripciones:", error)
    return []
  }
}
