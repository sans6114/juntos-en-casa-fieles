"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { ResetPasswordSchema, type ResetPasswordDTO } from "@/interfaces/auth"

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function resetPassword(data: ResetPasswordDTO) {
  const parsed = ResetPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    }
  }

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
    })

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return {
        ok: false as const,
        message: "El enlace es inválido o expiró. Solicitá uno nuevo.",
      }
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ])

    return {
      ok: true as const,
      message: "Contraseña actualizada. Ya podés iniciar sesión.",
    }
  } catch (error) {
    console.error("Error en resetPassword:", error)
    return {
      ok: false as const,
      message: "No se pudo actualizar la contraseña. Intentá de nuevo.",
    }
  }
}
