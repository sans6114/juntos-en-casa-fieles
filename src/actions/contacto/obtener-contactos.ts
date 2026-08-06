"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"

export async function obtenerContactosSinIglesia() {
  await requireAdmin()

  const inscripciones = await prisma.inscripcion.findMany({
    where: { congregacionId: null },
    include: {
      contacto: {
        include: {
          usuario: {
            select: { id: true, nombre: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return inscripciones.map((ins) => ({
    id: ins.id,
    nombre: ins.nombre,
    email: ins.email,
    telefono: ins.telefono,
    edad: ins.edad,
    createdAt: ins.createdAt.toISOString(),
    contactado: ins.contacto?.contactado ?? false,
    observacion: ins.contacto?.observacion ?? null,
    contactadoAt: ins.contacto?.contactadoAt?.toISOString() ?? null,
    colaboradorNombre: ins.contacto?.usuario.nombre ?? null,
    colaboradorEmail: ins.contacto?.usuario.email ?? null,
  }))
}
