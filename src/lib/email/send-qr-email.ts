import { transporter } from "./nodemailer"
import QRCode from "qrcode"
import fs from "fs"
import path from "path"

type SendQrEmailParams = {
  to: string
  nombre: string
  uuid: string
}

export async function sendQrEmail({ to, nombre, uuid }: SendQrEmailParams) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER
  if (!from) {
    console.error("Falta la variable de entorno EMAIL_FROM o EMAIL_USER")
    return
  }

  try {
    // Generación del QR
    const qrDataUrl = await QRCode.toDataURL(uuid, { width: 300, margin: 2 })
    const base64Data = qrDataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Cargar el logo localmente para enviarlo embebido (CID)
    const logoPath = path.join(process.cwd(), 'public/jec/logos/logoblanco.png')
    const logoBuffer = fs.readFileSync(logoPath)

    await transporter.sendMail({
      from,
      to,
      subject: "Tu código de inscripción — Juntos en Casa",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 460px; margin: 0 auto; color: #171717; text-align: center;">
          <h1 style="font-size: 20px; margin-bottom: 16px;">¡Inscripción confirmada!</h1>
          <p style="font-size: 14px; line-height: 1.6;">Hola ${nombre},</p>
          <p style="font-size: 14px; line-height: 1.6;">
            Tu inscripción para <strong>Juntos en Casa</strong> fue registrada correctamente.
            Guarda este código QR y presentalo los días del evento para acreditar tu asistencia.
          </p>
          <div style="margin: 32px 0;">
            <img src="cid:qrcode" alt="Código QR de inscripción" style="width: 250px; height: 250px; border-radius: 8px; border: 1px solid #e5e5e5; padding: 8px;" />
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: buffer,
          cid: 'qrcode',
          contentDisposition: 'inline',
          contentType: 'image/png' // <--- DECLARACIÓN EXPLÍCITA DEL FORMATO
        }
      ]
    })
  } catch (error) {
    console.error("Error generando o enviando QR:", error)
  }
}