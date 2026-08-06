const DEFAULT_COUNTRY_CODE = "54"

/** Normaliza un teléfono local a dígitos con código de país (AR por defecto). */
export function normalizePhoneForWhatsApp(
  telefono: string | null | undefined,
  countryCode = DEFAULT_COUNTRY_CODE
): string | null {
  if (!telefono) return null

  const digits = telefono.replace(/\D/g, "")
  if (digits.length < 8) return null

  if (digits.startsWith(countryCode)) return digits
  if (digits.startsWith("0")) {
    return `${countryCode}${digits.slice(1)}`
  }
  return `${countryCode}${digits}`
}

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
