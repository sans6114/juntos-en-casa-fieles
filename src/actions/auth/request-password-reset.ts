"use server"

import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { RequestPasswordResetSchema } from "@/interfaces/auth"
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset"

const GENERIC_MESSAGE =
  "Si el email está registrado, te enviamos un enlace para restablecer tu contraseña."
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function requestPasswordReset(email: string) {
  const parsed = RequestPasswordResetSchema.safeParse({ email })
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (user && user.activo) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      })

      const token = crypto.randomBytes(32).toString("hex")
      await prisma.passwordResetToken.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      })

      const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      const resetUrl = `${base}/admin/reset-password?token=${token}`
      await sendPasswordResetEmail({ to: user.email, nombre: user.nombre, resetUrl })
    }

    return { ok: true as const, message: GENERIC_MESSAGE }
  } catch (error) {
    console.error("Error en requestPasswordReset:", error)
    return { ok: true as const, message: GENERIC_MESSAGE }
  }
}
