import { resend } from "./resend"

type SendPasswordResetEmailParams = {
  to: string
  nombre: string
  resetUrl: string
}

export async function sendPasswordResetEmail({
  to,
  nombre,
  resetUrl,
}: SendPasswordResetEmailParams) {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error("Falta la variable de entorno EMAIL_FROM")
  }

  await resend.emails.send({
    from,
    to,
    subject: "Restablecé tu contraseña — Juntos en Casa",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #171717;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">Restablecer contraseña</h1>
        <p style="font-size: 14px; line-height: 1.6;">Hola ${nombre},</p>
        <p style="font-size: 14px; line-height: 1.6;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en el panel de
          <strong>Juntos en Casa</strong>. Hacé clic en el botón para elegir una nueva contraseña.
          Este enlace vence en 1 hora y solo puede usarse una vez.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #171717; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Restablecer contraseña
          </a>
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #737373;">
          Si no solicitaste este cambio, podés ignorar este correo; tu contraseña seguirá siendo la misma.
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #737373;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br />
          <span style="word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
    `,
  })
}
