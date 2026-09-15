"use server"

import { campoAsistencia, type DiaEvento } from "@/lib/asistencia/dia-evento"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guards"
import type { AsistenciaDTO } from "@/interfaces/inscripcion"

export async function obtenerAsistencias(dia: DiaEvento): Promise<AsistenciaDTO[]> {
  await requireSession()

  try {
    const campo = campoAsistencia(dia)

    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        [campo]: { not: null },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        [campo]: true,
      },
      orderBy: {
        [campo]: "desc",
      },
    })

    return inscripciones.map((ins) => ({
      id: ins.id,
      nombre: ins.nombre,
      email: ins.email,
      telefono: ins.telefono,
      // El `where` ya filtra `not: null`, asi que el campo siempre viene. Antes
      // habia un fallback a `new Date()` para el caso nulo: una rama muerta que,
      // de haberse ejecutado, habria mostrado una hora de llegada inventada.
      horaLlegada: (ins[campo] as Date).toISOString(),
    }))
  } catch (error) {
    console.error(`Error obteniendo asistencias día ${dia}:`, error)
    return []
  }
}
