"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  type AltaManualResult,
  type CrearInscripcionDTO,
  CrearInscripcionSchema,
} from "@/interfaces/inscripcion"
import { acreditarHoy } from "@/lib/asistencia/acreditar"
import { resolverCongregacionDeInscripcion } from "@/lib/congregacion/resolver"
import { requireSession } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

import { Prisma } from "../../../generated/client"

/**
 * Busca por email ignorando mayúsculas a propósito. `Inscripcion.email` es
 * `@unique` con índice sensible a mayúsculas y hay filas cargadas con mayúscula
 * inicial: con un `findUnique` exacto, el colaborador tipearía el mail en
 * minúscula, no encontraría a la persona, intentaría crearla y recién ahí se
 * comería un P2002 sin explicación, con gente esperando en la puerta.
 */
async function buscarPorEmail(email: string) {
  return prisma.inscripcion.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, nombre: true },
  })
}

/**
 * Alta de una inscripción desde el panel, para quien llega a la puerta sin
 * haberse anotado. NO envía el mail con el QR: la persona está parada ahí, y un
 * envío menos es un punto de falla menos el día que más importa. Si después hace
 * falta, queda el reenvío manual.
 *
 * `requireSession()` y no `requireAdmin()`: el alta de puerta la hace el
 * colaborador. El admin supervisa.
 */
export async function crearInscripcionManual(
  data: CrearInscripcionDTO
): Promise<AltaManualResult> {
  await requireSession()

  const parsed = CrearInscripcionSchema.safeParse(data)

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error)
    const fieldErrors: Partial<Record<keyof CrearInscripcionDTO, string>> = {}
    for (const key of Object.keys(flattened.fieldErrors) as (keyof CrearInscripcionDTO)[]) {
      const messages = flattened.fieldErrors[key]
      if (messages?.[0]) fieldErrors[key] = messages[0]
    }
    return { ok: false, message: "Revisá los datos ingresados.", fieldErrors }
  }

  try {
    const existente = await buscarPorEmail(parsed.data.email)
    if (existente) {
      return {
        ok: false,
        message: `${existente.nombre} ya está inscripto con ese email.`,
        yaInscripto: existente,
      }
    }

    const { congregacionId, sinCongregacion } = await resolverCongregacionDeInscripcion(parsed.data)

    const nueva = await prisma.inscripcion.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        edad: parsed.data.edad,
        congregacionId,
        sinCongregacion,
      },
    })

    // Si hoy se acredita, el alta acredita: quien carga a alguien en la puerta
    // lo está haciendo porque esa persona está entrando en ese momento.
    // `acreditarHoy` devuelve `fuera-de-fecha` los demás días y no escribe nada,
    // así que esto tambien sirve para cargar gente antes del evento.
    const acreditacion = await acreditarHoy(nueva.id)

    revalidatePath("/admin/inscripciones", "layout")
    revalidatePath("/admin/congregaciones")

    return {
      ok: true,
      inscripcionId: nueva.id,
      nombre: nueva.nombre,
      acreditada: acreditacion.estado === "acreditado",
      horaLlegada:
        acreditacion.estado === "acreditado" ? acreditacion.horaLlegada : undefined,
    }
  } catch (error) {
    // Carrera contra otra alta con el mismo email entre el chequeo y el create.
    // Se resuelve igual que el caso detectado arriba: con el id a mano para que
    // el diálogo pueda ofrecer acreditar, en vez de un error sin salida.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existente = await buscarPorEmail(parsed.data.email)
      if (existente) {
        return {
          ok: false,
          message: `${existente.nombre} ya está inscripto con ese email.`,
          yaInscripto: existente,
        }
      }
      return { ok: false, message: "Ya existe una inscripción con ese email." }
    }

    console.error("Error creando inscripción manual:", error)
    return { ok: false, message: "No se pudo crear la inscripción." }
  }
}
