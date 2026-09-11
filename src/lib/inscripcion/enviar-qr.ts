import { sendQrEmail } from "@/lib/email/send-qr-email"
import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/lib/seo/site"

/** `emailError` guarda el último mensaje, no un stack: se recorta para que la columna sea legible. */
const LARGO_MAXIMO_ERROR = 400

export type InscripcionParaEnvio = {
  id: string
  email: string
  nombre: string
  qrToken: string
}

/**
 * URL permanente del QR. Se arma desde `siteConfig.url` y NO desde
 * `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`, que es lo que
 * hace `request-password-reset.ts`: ese patrón manda un link a localhost si la
 * variable falta. `siteConfig.url` ya cae a las variables de Vercel.
 */
export function urlDelQr(qrToken: string) {
  return `${siteConfig.url}/mi-qr/${qrToken}`
}

/**
 * Manda el QR y DEJA CONSTANCIA de cómo salió.
 *
 * Es el único camino por el que se escribe el estado del envío, para que las
 * tres columnas signifiquen siempre lo mismo:
 * - `emailEnviadoAt`: momento del último envío exitoso.
 * - `emailError`: último error; se limpia cuando un envío sale bien.
 * - `emailIntentos`: total de intentos, contando el alta y cada reenvío.
 *
 * Nunca lanza. Se lo llama desde `after()`, donde una excepción no tiene a quién
 * avisarle y solo ensucia los logs; y desde el reenvío del panel, que necesita
 * un booleano y no un throw.
 */
export async function enviarQrYRegistrar(inscripcion: InscripcionParaEnvio): Promise<boolean> {
  let resultado
  try {
    resultado = await sendQrEmail({
      to: inscripcion.email,
      nombre: inscripcion.nombre,
      uuid: inscripcion.id,
      qrUrl: urlDelQr(inscripcion.qrToken),
    })
  } catch (error) {
    // `sendQrEmail` ya captura lo suyo; esto cubre un fallo inesperado antes de
    // su propio try (por ejemplo, al resolver la URL).
    const mensaje = error instanceof Error ? error.message : "Error desconocido"
    resultado = { ok: false as const, error: mensaje }
  }

  try {
    await prisma.inscripcion.update({
      where: { id: inscripcion.id },
      data: resultado.ok
        ? { emailEnviadoAt: new Date(), emailError: null, emailIntentos: { increment: 1 } }
        : {
            emailError: resultado.error.slice(0, LARGO_MAXIMO_ERROR),
            emailIntentos: { increment: 1 },
          },
    })
  } catch (error) {
    // La escritura dentro de `after()` es best-effort: si la función se congela
    // o se corta, se pierde. Por eso el panel de reenvío es manual y nunca
    // automático: `emailEnviadoAt` en null no prueba que el mail no haya salido.
    console.error("No se pudo registrar el estado del envío de QR:", error)
  }

  return resultado.ok
}
