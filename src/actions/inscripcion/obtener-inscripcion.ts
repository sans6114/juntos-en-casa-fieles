"use server"

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guards"
import { esCandidatoPastoral } from "@/lib/contacto/es-candidato-pastoral"

export async function obtenerInscripcionPorId(id: string) {
  const user = await requireSession()

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id },
    include: {
      congregacion: true,
      contacto: {
        include: {
          usuario: {
            select: { id: true, nombre: true, email: true },
          },
        },
      },
    },
  })

  if (!inscripcion) {
    notFound()
  }

  // Colaborador solo puede ver detalle de candidatos a contacto pastoral
  if (user.rol === "COLABORADOR" && !esCandidatoPastoral(inscripcion)) {
    notFound()
  }

  return {
    id: inscripcion.id,
    nombre: inscripcion.nombre,
    email: inscripcion.email,
    telefono: inscripcion.telefono,
    edad: inscripcion.edad,
    congregacionId: inscripcion.congregacionId,
    congregacionNombre: inscripcion.congregacion?.nombre ?? inscripcion.congregacionTexto ?? null,
    createdAt: inscripcion.createdAt.toISOString(),
    puedeContactar: esCandidatoPastoral(inscripcion),
    contacto: inscripcion.contacto
      ? {
          id: inscripcion.contacto.id,
          contactado: inscripcion.contacto.contactado,
          observacion: inscripcion.contacto.observacion,
          contactadoAt: inscripcion.contacto.contactadoAt?.toISOString() ?? null,
          usuarioId: inscripcion.contacto.usuarioId,
          usuarioNombre: inscripcion.contacto.usuario.nombre,
          usuarioEmail: inscripcion.contacto.usuario.email,
        }
      : null,
  }
}
