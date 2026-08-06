"use server"

import { cookies } from "next/headers"
import { signSession } from "@/lib/session"

export async function loginAdmin(email: string, password: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const secret = process.env.SESSION_SECRET || "fallback-secret-key-1234567890"

    if (email !== adminEmail || password !== adminPassword) {
      return { ok: false, message: "Credenciales incorrectas." }
    }

    const oneDay = 24 * 60 * 60 * 1000
    const exp = Date.now() + oneDay

    const sessionToken = await signSession({ email, exp }, secret)

    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    return { ok: true }
  } catch (error) {
    console.error("Error en loginAdmin:", error)
    return { ok: false, message: "Ocurrió un error en el servidor." }
  }
}
