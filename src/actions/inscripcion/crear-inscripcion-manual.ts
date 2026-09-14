"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod"

import {
  type AltaManualResult,
  type CrearInscripcionManualDTO,
  CrearInscripcionManualSchema,
} from "@/interfaces/inscripcion"
import { acreditarHoy } from "@/lib/asistencia/acreditar"
import { resolverCongregacionDeInscripcion } from "@/lib/congregacion/resolver"
import { enviarQrYRegistrar } from "@/lib/inscripcion/enviar-qr"
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
 * haberse anotado.
 *
 * El email es OPCIONAL acá y obligatorio en el formulario público. En la puerta
 * pedirlo solo lograba que se inventaran direcciones, y la persona se acredita
 * en el acto igual.
 *
 * Si SÍ dio una dirección, se le manda el QR como a cualquiera. No le sirve para
 * hoy —ya entró— pero sí para el día siguiente, y tenerlo en el mail es una vía
 * más además del botón de WhatsApp de su fila, que manda el link permanente a
 * `/mi-qr/<token>`. Ese botón siempre está: el teléfono SÍ es obligatorio acá.
 *
 * El envío va en `after()` y nunca bloquea la respuesta. Eso importa más acá que
 * en el formulario público: del otro lado del diálogo hay un colaborador con
 * gente esperando, y el SMTP no puede hacerlo esperar. Si el mail falla, la
 * inscripción y la acreditación ya están guardadas, y el fallo queda registrado
 * en `emailError` para verlo en la grilla.
 *
 * `requireSession()` y no `requireAdmin()`: el alta de puerta la hace el
 * colaborador. El admin supervisa.
 */
export async function crearInscripcionManual(
  data: CrearInscripcionManualDTO
): Promise<AltaManualResult> {
  await requireSession()

  const parsed = CrearInscripcionManualSchema.safeParse(data)

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error)
    const fieldErrors: Partial<Record<keyof CrearInscripcionManualDTO, string>> = {}
    for (const campo of Object.keys(flattened.fieldErrors) as (keyof CrearInscripcionManualDTO)[]) {
      const primero = flattened.fieldErrors[campo]?.[0]
      if (primero) fieldErrors[campo] = primero
    }
    return { ok: false, message: "Revisá los datos ingresados.", fieldErrors }
  }

  try {
    // Solo tiene sentido buscar duplicados si dieron un mail: es la única clave
    // por la que se puede reconocer a alguien ya anotado. Sin mail se crea
    // directamente, y si la persona ya estaba, el colaborador la encuentra
    // buscándola por nombre en la grilla.
    if (parsed.data.email) {
      const existente = await buscarPorEmail(parsed.data.email)
      if (existente) {
        return {
          ok: false,
          message: `${existente.nombre} ya está inscripto con ese email.`,
          yaInscripto: existente,
        }
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

    // Solo si dieron dirección: acá el email es opcional y la mayoría de las
    // altas de puerta no traen ninguna.
    const emailDestino = nueva.email
    if (emailDestino) {
      after(() =>
        enviarQrYRegistrar({
          id: nueva.id,
          email: emailDestino,
          nombre: nueva.nombre,
          qrToken: nueva.qrToken,
        })
      )
    }

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
      if (parsed.data.email) {
        const existente = await buscarPorEmail(parsed.data.email)
        if (existente) {
          return {
            ok: false,
            message: `${existente.nombre} ya está inscripto con ese email.`,
            yaInscripto: existente,
          }
        }
      }
      return { ok: false, message: "Ya existe una inscripción con ese email." }
    }

    console.error("Error creando inscripción manual:", error)
    return { ok: false, message: "No se pudo crear la inscripción." }
  }
}
