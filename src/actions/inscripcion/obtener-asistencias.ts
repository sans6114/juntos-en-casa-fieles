"use server"

import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guards"
import type { AsistenciaDTO } from "@/interfaces/inscripcion"

export async function obtenerAsistencias(dia: 1 | 2 | 3): Promise<AsistenciaDTO[]> {
  await requireSession()

  try {
    const fieldName = `asistenciaDia${dia}` as const

    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        [fieldName]: {
          not: null,
        },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        asistenciaDia1: true,
        asistenciaDia2: true,
        asistenciaDia3: true,
      },
      orderBy: {
        [fieldName]: "desc",
      },
    })

    return inscripciones.map((ins) => {
      let dateVal: Date | null = null;
      if (dia === 1) dateVal = ins.asistenciaDia1;
      else if (dia === 2) dateVal = ins.asistenciaDia2;
      else if (dia === 3) dateVal = ins.asistenciaDia3;

      return {
        id: ins.id,
        nombre: ins.nombre,
        email: ins.email,
        telefono: ins.telefono,
        horaLlegada: dateVal ? dateVal.toISOString() : new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error(`Error obteniendo asistencias día ${dia}:`, error)
    return []
  }
}
