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
      return { ok: false as const, message: "Credenciales incorrectas." }
    }
    console.error("Error en loginAdmin:", error)
    return { ok: false as const, message: "Ocurrió un error en el servidor." }
  }
}
