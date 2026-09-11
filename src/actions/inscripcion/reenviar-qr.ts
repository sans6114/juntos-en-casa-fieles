"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth-guards"
import { enviarQrYRegistrar } from "@/lib/inscripcion/enviar-qr"
import { prisma } from "@/lib/prisma"

/**
 * Tope por tanda. Nodemailer está sin pool, así que cada mail abre su propia
 * conexión SMTP: mandar cientos de un saque agota el tiempo de la función y
 * llama la atención del proveedor. Además el tope obliga a ver el resultado de
 * una tanda antes de lanzar la siguiente, que es justo lo que se quiere el día
 * del evento.
 */
const LOTE_MAXIMO = 25

/** Respiro entre envíos, por la misma razón. */
const PAUSA_MS = 250

const DATOS_DE_ENVIO = { id: true, email: true, nombre: true, qrToken: true } as const

/**
 * "Pendiente" es NUNCA ENVIADO CON ÉXITO, y no "el último intento falló".
 * A quien ya recibió su QR no se le reenvía en una tanda masiva aunque un
 * reintento posterior haya fallado: ya lo tiene, y mandarle un duplicado a días
 * del evento es peor que el problema que se quiere resolver.
 */
const PENDIENTES = { emailEnviadoAt: null }

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Reenvía el QR a una persona puntual. Sirve incluso si ya lo había recibido. */
export async function reenviarQr(inscripcionId: string) {
  await requireSession()

  try {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      select: DATOS_DE_ENVIO,
    })

    if (!inscripcion) return { ok: false as const, message: "No encontramos esa inscripción." }

    const enviado = await enviarQrYRegistrar(inscripcion)
    revalidatePath("/admin/inscripciones", "layout")

    return enviado
      ? { ok: true as const, message: `QR reenviado a ${inscripcion.email}.` }
      : {
          ok: false as const,
          message: "No se pudo enviar. El error quedó registrado en la fila.",
        }
  } catch (error) {
    console.error("Error reenviando QR:", error)
    return { ok: false as const, message: "No se pudo reenviar el QR." }
  }
}

/**
 * Reenvía en tanda a quienes nunca recibieron su QR. Es MANUAL y acotado a
 * propósito: la escritura del estado dentro de `after()` es best-effort, así que
 * `emailEnviadoAt` en null no prueba que el mail no haya salido. Automatizar
 * esto sería mandar duplicados a ciegas.
 */
export async function reenviarQrPendientes() {
  await requireSession()

  try {
    const pendientes = await prisma.inscripcion.findMany({
      where: PENDIENTES,
      select: DATOS_DE_ENVIO,
      orderBy: { createdAt: "asc" },
      take: LOTE_MAXIMO,
    })

    if (pendientes.length === 0) {
      return { ok: true as const, enviados: 0, fallidos: 0, restantes: 0, message: "No hay QR pendientes." }
    }

    let enviados = 0
    let fallidos = 0

    // Secuencial y con pausa: en paralelo se abren 25 conexiones SMTP a la vez.
    for (const inscripcion of pendientes) {
      const salio = await enviarQrYRegistrar(inscripcion)
      if (salio) enviados++
      else fallidos++
      await esperar(PAUSA_MS)
    }

    const restantes = await prisma.inscripcion.count({ where: PENDIENTES })
    revalidatePath("/admin/inscripciones", "layout")

    return {
      ok: true as const,
      enviados,
      fallidos,
      restantes,
      message:
        `Se enviaron ${enviados}${fallidos ? `, fallaron ${fallidos}` : ""}.` +
        (restantes ? ` Quedan ${restantes} pendientes.` : ""),
    }
  } catch (error) {
    console.error("Error reenviando QR pendientes:", error)
    return {
      ok: false as const,
      enviados: 0,
      fallidos: 0,
      restantes: 0,
      message: "No se pudo completar el reenvío.",
    }
  }
}
