import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import type { SessionUser } from "@/auth.config"
import {
  ADMIN_PATHS,
  defaultHomeForRole,
  isAdminRole,
} from "@/lib/admin-access"

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user as SessionUser
}

// funcion que verifica si el usuario esta autenticado
export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    redirect(ADMIN_PATHS.login)
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSession()
  if (!isAdminRole(user.rol)) {
    redirect(defaultHomeForRole(user.rol))
  }
  return user
}
