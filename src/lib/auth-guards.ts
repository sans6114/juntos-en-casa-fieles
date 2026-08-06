import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import type { SessionUser } from "@/auth.config"

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user as SessionUser
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    redirect("/admin/login")
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSession()
  if (user.rol !== "ADMIN") {
    redirect("/admin/inscripciones/grilla")
  }
  return user
}
