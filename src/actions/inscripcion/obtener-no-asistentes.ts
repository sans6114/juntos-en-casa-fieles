"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { buildWhatsAppUrl } from "@/utils/whatsapp"
import type { NoAsistenteDTO, NoAsistentesResult } from "@/interfaces/inscripcion"

const RESULTADO_VACIO: NoAsistentesResult = {
  personas: [],
  resumen: { totalInscriptos: 0, nunca: 0, soloDia1: 0, soloDia2: 0, ambosDias: 0 },
}

/**
 * Quienes se inscribieron y faltaron al menos un día.
 *
 * UNA sola consulta para los tres grupos que muestra la página. Los grupos se
 * SOLAPAN —quien nunca vino falta al día 1 y al día 2 a la vez—, así que pedir
 * una consulta por solapa traería a esa gente tres veces y obligaría a que tres
 * `where` distintos se mantengan coherentes entre sí. Acá el criterio vive en
 * un solo lugar y la pantalla deriva los grupos de las dos nulidades.
 *
 * El filtro va en SQL y no en memoria: quien vino los dos días no es parte de
 * esta pantalla y no tiene por qué viajar. Mismo criterio que `PASTORAL_WHERE`
 * en `lib/contacto/es-candidato-pastoral.ts`.
 *
 * `requireAdmin` y no `requireSession`: esto es trabajo de seguimiento
 * coordinado —a quién se le escribe y quién ya lo hizo—, del mismo tipo que
 * `/admin/contacto`, y no trabajo de puerta.
 */
export async function obtenerNoAsistentes(): Promise<NoAsistentesResult> {
  await requireAdmin()

  try {
    // El total va en la misma tanda: sin él no se puede decir qué parte del
    // evento representa cada grupo, y quien vino los dos días —justamente el
    // que da sentido a la comparación— no está en la consulta de arriba.
    const [inscripciones, totalInscriptos] = await Promise.all([
      prisma.inscripcion.findMany({
      where: {
        OR: [{ asistenciaDia1: null }, { asistenciaDia2: null }],
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        edad: true,
        asistenciaDia1: true,
        asistenciaDia2: true,
        sinCongregacion: true,
        congregacion: { select: { nombre: true } },
      },
      // Por nombre y no por fecha de inscripción: esta lista se recorre
      // buscando personas, no viendo quién se anotó último.
        orderBy: { nombre: "asc" },
      }),
      prisma.inscripcion.count(),
    ])

    const personas: NoAsistenteDTO[] = inscripciones.map((ins) => ({
      id: ins.id,
      nombre: ins.nombre,
      email: ins.email,
      telefono: ins.telefono,
      edad: ins.edad,
      asistenciaDia1: ins.asistenciaDia1?.toISOString() ?? null,
      asistenciaDia2: ins.asistenciaDia2?.toISOString() ?? null,
      congregacionNombre: ins.congregacion?.nombre ?? null,
      sinCongregacion: ins.sinCongregacion,
      // Sin mensaje: ver la nota en `NoAsistenteDTO`.
      whatsappUrl: buildWhatsAppUrl(ins.telefono),
    }))

    // Los tres se cuentan sobre las filas que ya están en memoria; el cuarto se
    // deduce. Quien vino los dos días es, por definición, todo el que NO entró
    // en esta consulta, así que restarlo es exacto y evita una cuarta query.
    const nunca = personas.filter((p) => !p.asistenciaDia1 && !p.asistenciaDia2).length
    const soloDia1 = personas.filter((p) => p.asistenciaDia1 && !p.asistenciaDia2).length
    const soloDia2 = personas.filter((p) => !p.asistenciaDia1 && p.asistenciaDia2).length

    return {
      personas,
      resumen: {
        totalInscriptos,
        nunca,
        soloDia1,
        soloDia2,
        ambosDias: totalInscriptos - personas.length,
      },
    }
  } catch (error) {
    console.error("Error obteniendo no asistentes:", error)
    return RESULTADO_VACIO
  }
}
