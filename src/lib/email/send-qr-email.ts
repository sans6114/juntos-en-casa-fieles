import { transporter } from "./nodemailer"
import QRCode from "qrcode"

type SendQrEmailParams = {
  to: string
  nombre: string
  /** Lo que codifica el QR: el `id` de la inscripción. */
  uuid: string
  /** Link permanente a /mi-qr. Va en el mail para que perderlo deje de importar. */
  qrUrl?: string
}

export type ResultadoEnvio = { ok: true } | { ok: false; error: string }

/**
 * `nombre` llega de un formulario público y se interpola en HTML. Sin escapar,
 * un nombre con `<` o comillas rompe el layout del mail, y con markup completo
 * es inyección en el cuerpo del mensaje.
 */
function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Envía el mail con el QR y DEVUELVE si salió o no.
 *
 * Antes se tragaba todos sus errores con un `console.error`. Como además corre
 * dentro de `after()`, un fallo masivo de envío era indistinguible del éxito
 * desde la aplicación: para saber si funcionaba había que salir a cruzar la base
 * con los logs del hosting. Ahora el resultado vuelve al llamador, que es quien
 * lo persiste.
 *
 * Sigue sin saber nada de Prisma a propósito: esto manda mails, no registra
 * estado. Esa parte vive en `src/lib/inscripcion/enviar-qr.ts`.
 */
export async function sendQrEmail({
  to,
  nombre,
  uuid,
  qrUrl,
}: SendQrEmailParams): Promise<ResultadoEnvio> {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER
  if (!from) {
    const error = "Falta la variable de entorno EMAIL_FROM o EMAIL_USER"
    console.error(error)
    return { ok: false, error }
  }

  try {
    // Generación del QR
    const qrDataUrl = await QRCode.toDataURL(uuid, { width: 300, margin: 2 })
    const base64Data = qrDataUrl.split(",")[1]
    const buffer = Buffer.from(base64Data, "base64")

    const bloqueEnlace = qrUrl
      ? `
          <p style="font-size: 14px; line-height: 1.6;">
            ¿No ves el código o perdiste este mail? Abrilo cuando quieras desde acá:
          </p>
          <p style="font-size: 14px; line-height: 1.6; word-break: break-all;">
            <a href="${qrUrl}" style="color: #171717;">${qrUrl}</a>
          </p>
        `
      : ""

    await transporter.sendMail({
      from,
      to,
      subject: "Tu código de inscripción — Juntos en Casa",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 460px; margin: 0 auto; color: #171717; text-align: center;">
          <h1 style="font-size: 20px; margin-bottom: 16px;">¡Inscripción confirmada!</h1>
          <p style="font-size: 14px; line-height: 1.6;">Hola ${escaparHtml(nombre)},</p>
          <p style="font-size: 14px; line-height: 1.6;">
            Tu inscripción para <strong>Juntos en Casa</strong> fue registrada correctamente.
            Guarda este código QR y presentalo los días del evento para acreditar tu asistencia.
          </p>
          <div style="margin: 32px 0;">
            <img src="cid:qrcode" alt="Código QR de inscripción" style="width: 250px; height: 250px; border-radius: 8px; border: 1px solid #e5e5e5; padding: 8px;" />
          </div>
          ${bloqueEnlace}
        </div>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: buffer,
          cid: "qrcode",
          contentDisposition: "inline",
          contentType: "image/png", // <--- DECLARACIÓN EXPLÍCITA DEL FORMATO
        },
      ],
    })

    return { ok: true }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido enviando el QR"
    console.error("Error generando o enviando QR:", error)
    return { ok: false, error: mensaje }
  }
}
