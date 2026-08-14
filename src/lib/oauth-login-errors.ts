export function getOAuthLoginErrorMessage(error: string, reason?: string) {
  if (error === "AccessDenied") {
    if (reason === "inactive") {
      return "Tu cuenta está desactivada. Contactá al administrador."
    }
    return "Esa cuenta de Google no está autorizada. Contactá al administrador."
  }
  return "No se pudo iniciar sesión con Google. Intentá de nuevo."
}
