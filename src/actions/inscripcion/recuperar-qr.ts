"use server"

import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimitByKey } from "@/lib/rate-limit"
import { RecuperarQrSchema, type RecuperarQrResult } from "@/interfaces/inscripcion"

/**
 * Busca el QR de alguien que ya se inscribió, a partir de su email.
 *
 * Sobre enumeración de emails: esta página es, por diseño, un oráculo de "quién
 * está inscripto", porque toda la UX depende de responder distinto según el
 * caso. Es aceptable —y no un descuido— porque ESE ORÁCULO YA EXISTE hoy: el
 * formulario público devuelve "Ya existe una inscripción con ese email" ante un
 * duplicado. No se agrega ninguna capacidad que un atacante no tenga.
 * No lo "arregles" devolviendo un mensaje genérico: eso rompe la feature.
 *
 * Lo que sí se evita: devolver el nombre. Con el QR alcanza para acreditarse, y
 * no exponer a quién pertenece deja el dato personal fuera del alcance de quien
 * solo adivinó una dirección.
 */
export async function recuperarQr(email: string): Promise<RecuperarQrResult> {
  // Antes que nada: es una acción pública y sin sesión. Sin esto, la página es
  // un cañón de consultas gratis contra la base el día que más tráfico tiene.
  // Honestidad sobre esta defensa: `rate-limit.ts` es un Map en memoria por
  // instancia, así que frena el caso ingenuo, no un ataque real.
  const ip = await getClientIp()
  const permitido = await rateLimitByKey(`recuperar-qr:${ip}`, 10, 10 * 60 * 1000)
  if (!permitido) {
    return {
      estado: "limitado",
      message: "Demasiados intentos. Esperá un minuto y probá de nuevo.",
    }
  }

  const parsed = RecuperarQrSchema.safeParse({ email })
  if (!parsed.success) {
    return {
      estado: "invalido",
      message: parsed.error.issues[0]?.message ?? "Revisá el email ingresado.",
    }
  }

  try {
    // `findFirst` con `mode: "insensitive"` y no `findUnique`: el índice de
    // `email` es sensible a mayúsculas y pueden entrar filas sin normalizar
    // durante la ventana de deploy, antes de que corra el backfill. Con 300
    // filas, saltear el índice único no cuesta nada.
    const inscripcion = await prisma.inscripcion.findFirst({
      where: { email: { equals: parsed.data.email, mode: "insensitive" } },
      select: { id: true },
    })

    if (!inscripcion) {
      return { estado: "no-encontrado", email: parsed.data.email }
    }

    // El QR codifica el `id`, igual que el del mail original: se regenera
    // determinísticamente, así que este es el MISMO código que ya tiene, no uno
    // nuevo. Por eso no hace falta guardarlo en ningún lado.
    return { estado: "encontrado", qrValue: inscripcion.id }
  } catch (error) {
    console.error("Error recuperando QR:", error)
    return {
      estado: "error",
      message: "No pudimos buscar tu inscripción. Probá de nuevo en un momento.",
    }
  }
}
