import type { Role } from '../../generated/client';

export const ADMIN_PATHS = {
  login: "/admin/login",
  forgotPassword: "/admin/forgot-password",
  resetPassword: "/admin/reset-password",
  adminHome: "/admin/inscripciones",
  colaboradorHome: "/admin/inscripciones/grilla",
  contacto: "/admin/contacto",
  usuarios: "/admin/usuarios",
  congregaciones: "/admin/congregaciones",
};

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
    /^\/admin\/inscripciones\/[^/]+$/.test(pathname)
  )
}

export function canAccessAdminPath(rol: Role, pathname: string): boolean {
  if (isAdminRole(rol)) return true
  return canColaboradorAccessPath(pathname)
}
