import type { Role } from '../../generated/client';

export const ADMIN_PATHS = {
  login: "/admin/login",
  forgotPassword: "/admin/forgot-password",
  resetPassword: "/admin/reset-password",
  adminHome: "/admin/inscripciones",
  colaboradorHome: "/admin/inscripciones/grilla",
  contacto: "/admin/contacto",
  usuarios: "/admin/usuarios",
  contenidos: "/admin/contenidos",
  congregaciones: "/admin/congregaciones",
  productos: "/admin/productos",
};

/** Un solo listado, dos consumidores (el allowlist de rutas y el nav), para
 *  que no puedan desincronizarse. */
const RUTAS_CATALOGO = [ADMIN_PATHS.contenidos, ADMIN_PATHS.productos];

const ROLES_CATALOGO: Role[] = ["ADMIN", "COLABORADOR"];

/**
 * Con solo dos roles, esto equivale hoy a `requireSession()`. El predicado
 * nombrado igual gana su lugar: deja el permiso auditable en un solo punto y
 * evita que un futuro tercer rol herede en silencio el acceso al catálogo.
 */
export function canManageCatalogo(rol: Role): boolean {
  return ROLES_CATALOGO.includes(rol);
}

export function isPublicAdminAuthPath(pathname: string): boolean {
  const path = pathname.split("?")[0]
  return (
    path === ADMIN_PATHS.login ||
    path === ADMIN_PATHS.forgotPassword ||
    path === ADMIN_PATHS.resetPassword
  )
}

export function isAdminRole(rol: Role): boolean {
  return rol === "ADMIN"
}

export function defaultHomeForRole(rol: Role): string {
  return isAdminRole(rol) ? ADMIN_PATHS.adminHome : ADMIN_PATHS.colaboradorHome
}

export function canColaboradorAccessPath(pathname: string): boolean {
  return (
    pathname.startsWith(ADMIN_PATHS.colaboradorHome) ||
    pathname.startsWith("/admin/escanear-qr") ||
    pathname.startsWith("/admin/asistencias") ||
    /^\/admin\/inscripciones\/[^/]+$/.test(pathname) ||
    RUTAS_CATALOGO.some((r) => pathname.startsWith(r))
  )
}

export function canAccessAdminPath(rol: Role, pathname: string): boolean {
  if (isAdminRole(rol)) return true
  return canColaboradorAccessPath(pathname)
}
