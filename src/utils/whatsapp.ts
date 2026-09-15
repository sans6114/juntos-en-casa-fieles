const CODIGO_PAIS_AR = "54"

/**
 * Cantidad de dígitos de un número argentino sin prefijos: código de área
 * (2 a 4) más el abonado, siempre 10 en total. Ej.: 221 + 4567890, 11 + 23456789.
 */
const LARGO_NACIONAL = 10

/**
 * Normaliza un teléfono argentino al formato que WhatsApp necesita.
 *
 * WhatsApp identifica los móviles argentinos como `54` + `9` + área + abonado,
 * o sea 13 dígitos. La versión anterior de esta función anteponía `54` pero
 * NUNCA insertaba ese `9`, así que producía `54 221 4567890`: un número que
 * WhatsApp no resuelve. Medido contra la base de producción, generaba un link
 * en formato canónico para 6 de 298 personas.
 *
 * Devuelve `null` cuando no puede producir un número canónico, en vez de
 * inventar uno. Un link roto falla en silencio cuando alguien ya lo tocó; un
 * `null` se puede mostrar como "sin teléfono utilizable" antes de intentarlo.
 */
export function normalizePhoneForWhatsApp(
  telefono: string | null | undefined,
  codigoPais = CODIGO_PAIS_AR
): string | null {
  if (!telefono) return null

  const digitos = telefono.replace(/\D/g, "")
  if (!digitos) return null

  let resto = digitos

  // 1. Sacar el prefijo internacional si vino escrito.
  if (resto.startsWith(`${codigoPais}9`)) resto = resto.slice(codigoPais.length + 1)
  else if (resto.startsWith(codigoPais)) resto = resto.slice(codigoPais.length)

  // 2. Sacar el 0 de larga distancia nacional (0221 …).
  if (resto.startsWith("0")) resto = resto.slice(1)

  // 3. Sacar el 9 de móvil si sobrevivió a los pasos anteriores. No existen
  //    códigos de área argentinos que empiecen con 9, así que un 9 inicial con
  //    un dígito de más solo puede ser el marcador de celular.
  if (resto.length === LARGO_NACIONAL + 1 && resto.startsWith("9")) resto = resto.slice(1)

  // 4. Sacar el 15 del formato viejo (0221 15 4567890). Va DESPUÉS del código de
  //    área, que mide entre 2 y 4 dígitos, así que se prueban las tres
  //    posiciones y solo se acepta la que deja exactamente 10 dígitos.
  if (resto.length === LARGO_NACIONAL + 2) {
    for (const largoArea of [2, 3, 4]) {
      if (resto.slice(largoArea, largoArea + 2) === "15") {
        resto = resto.slice(0, largoArea) + resto.slice(largoArea + 2)
        break
      }
    }
  }

  // 5. Si no quedaron exactamente 10 dígitos, el número está incompleto o tiene
  //    una forma que no sabemos interpretar. Antes se devolvía igual y el link
  //    simplemente no abría ningún chat.
  if (resto.length !== LARGO_NACIONAL) return null

  return `${codigoPais}9${resto}`
}

/**
 * Link de WhatsApp con mensaje prellenado, o `null` si el teléfono no sirve.
 *
 * Importante: `wa.me` solo admite TEXTO. No se puede adjuntar el QR como imagen,
 * así que lo que se manda es el link a `/mi-qr/<token>`.
 */
export function buildWhatsAppUrl(
  telefono: string | null | undefined,
  message?: string
): string | null {
  const normalized = normalizePhoneForWhatsApp(telefono)
  if (!normalized) return null

  const base = `https://wa.me/${normalized}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
