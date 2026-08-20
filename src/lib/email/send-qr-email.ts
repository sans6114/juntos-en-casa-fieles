import { resend } from "./resend"
import QRCode from "qrcode"

type SendQrEmailParams = {
  to: string
  nombre: string
  uuid: string
}

export async function sendQrEmail({ to, nombre, uuid }: SendQrEmailParams) {
  const from = process.env.EMAIL_FROM
  if (!from) {
    console.error("Falta la variable de entorno EMAIL_FROM")
    return
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(uuid, { width: 300, margin: 2 })
    const base64Data = qrDataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    const { error, data } = await resend.emails.send({
      from,
      to,
      subject: "Tu código de inscripción — Juntos en Casa",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #171717; text-align: center;">
          <h1 style="font-size: 20px; margin-bottom: 16px;">¡Inscripción confirmada!</h1>
          <p style="font-size: 14px; line-height: 1.6;">Hola ${nombre},</p>
          <p style="font-size: 14px; line-height: 1.6;">
            Tu inscripción para <strong>Juntos en Casa</strong> fue registrada correctamente.
            Guarda este código QR y presentalo los días del evento para acreditar tu asistencia.
          </p>
          <div style="margin: 32px 0;">
            <img src="cid:qrcode" alt="Código QR de inscripción" style="width: 250px; height: 250px; border-radius: 8px; border: 1px solid #e5e5e5; padding: 8px;" />
          </div>
          <p style="font-size: 12px; line-height: 1.6; color: #737373;">
            Identificador: ${uuid}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: buffer,
          contentId: 'qrcode',
        }
      ]
    })

    if (error) {
      console.error("Error enviando email de QR:", error)
    }
  } catch (error) {
    console.error("Error generando o enviando QR:", error)
  }
}
