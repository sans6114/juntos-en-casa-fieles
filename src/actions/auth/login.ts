"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/auth.config"

export async function loginAdmin(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { ok: true as const }
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as { code?: string }).code
      if (error.type === "CredentialsSignin" && code === "account_disabled") {
        return {
          ok: false as const,
          message: "Tu cuenta está desactivada. Contactá al administrador.",
        }
      }
      return { ok: false as const, message: "Email o contraseña incorrectos." }
    }
    console.error("Error en loginAdmin:", error)
    return {
      ok: false as const,
      message: "Ocurrió un error en el servidor. Intentá de nuevo.",
    }
  }
}
