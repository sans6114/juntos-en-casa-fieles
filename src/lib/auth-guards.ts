import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import type { SessionUser } from "@/auth.config"
import {
  ADMIN_PATHS,
  canManageCatalogo,
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

/**
 * Misma regla de autorización que `requireAdmin()` (`isAdminRole`), otra
 * política de fallo: acá se TIRA un error en vez de llamar `redirect()`.
 *
 * Existe porque `redirect()` lanza `NEXT_REDIRECT`, y ese throw solo se
 * convierte en navegación cuando sube hasta el framework. Dentro de un
 * callback de terceros —`onBeforeGenerateToken` de `handleUpload`, por
 * ejemplo— queda silenciado y termina en un 400 genérico. En una ruta que
 * responde JSON, además, redirigir no es la semántica correcta.
 *
 * Usar en rutas `app/api`. Para pages y server actions va `requireAdmin()`.
 */
export async function requireAdminApi(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || !isAdminRole(user.rol)) {
    throw new Error("No autorizado")
  }
  return user
}

/**
 * Misma forma que `requireAdmin()`, pero autoriza con `canManageCatalogo()`
 * en vez de `isAdminRole()`: ADMIN y COLABORADOR pueden gestionar Contenidos
 * y Productos.
 */
export async function requireCatalogo(): Promise<SessionUser> {
  const user = await requireSession()
  if (!canManageCatalogo(user.rol)) {
    redirect(defaultHomeForRole(user.rol))
  }
  return user
}

/**
 * Gemela de `requireAdminApi()`: misma regla de autorización que
 * `requireCatalogo()` (`canManageCatalogo`), pero TIRA en vez de redirigir,
 * por la misma razón documentada en `requireAdminApi()` — necesaria para
 * `onBeforeGenerateToken` de `handleUpload()`.
 */
export async function requireCatalogoApi(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || !canManageCatalogo(user.rol)) {
    throw new Error("No autorizado")
  }
  return user
}
