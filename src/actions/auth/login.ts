"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { signIn } from "@/auth.config"

export type LoginAdminState = {
  ok: boolean
  message?: string
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function loginAdmin(
  _prevState: LoginAdminState,
  formData: FormData
): Promise<LoginAdminState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, message: "Completá todos los campos." }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as { code?: string }).code
      if (error.type === "CredentialsSignin" && code === "account_disabled") {
        return {
          ok: false,
          message: "Tu cuenta está desactivada. Contactá al administrador.",
        }
      }
      return { ok: false, message: "Email o contraseña incorrectos." }
    }
    console.error("Error en loginAdmin:", error)
    return {
      ok: false,
      message: "Ocurrió un error en el servidor. Intentá de nuevo.",
    }
  }

  redirect("/admin")
}
