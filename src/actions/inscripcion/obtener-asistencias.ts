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
      // Los dos días se piden EXPLÍCITOS y se elige en JS. Antes el select
      // llevaba la clave computada `[campo]: true`, y eso le arruinaba a Prisma
      // la inferencia de TODO el objeto: `ins.email` quedaba en `any` y
      // TypeScript dejaba pasar que `AsistenciaDTO.email` dijera `string`
      // mientras la columna es `String?`. Esa mentira reventaba el buscador en
      // producción con un `Cannot read properties of null`.
      //
      // Dos campos de más en el SELECT es un precio ridículo comparado con
      // perder el chequeo de tipos de todo el resto.
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        asistenciaDia1: true,
        asistenciaDia2: true,
      },
      orderBy: {
        [campo]: "desc",
      },
    })

    return inscripciones.map((ins) => {
      const llegada = dia === 1 ? ins.asistenciaDia1 : ins.asistenciaDia2

      return {
        id: ins.id,
        nombre: ins.nombre,
        email: ins.email,
        telefono: ins.telefono,
        // El `where` ya filtra `not: null`, así que siempre viene. Antes había
        // un fallback a `new Date()`: una rama muerta que, de ejecutarse,
        // habría mostrado una hora de llegada inventada.
        horaLlegada: (llegada as Date).toISOString(),
      }
    })
  } catch (error) {
    console.error(`Error obteniendo asistencias día ${dia}:`, error)
    return []
  }
}
