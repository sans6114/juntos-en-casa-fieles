import { siteConfig } from "@/lib/seo/site"

export type UbicacionInfo = {
  venue: string
  /**
   * `null` mientras no haya dirección confirmada. La vista lo marca como dato
   * pendiente con `PlaceholderTag`, así el estado vive en el tipo y no en una
   * cadena que dice "(placeholder)" y que algún día se olvida de limpiar.
   */
  street: string | null
  city: string
  mapsUrl: string
}

// Sin dirección confirmada todavía. Cuando llegue, poner el valor real acá
// y sumarlo al `query` de abajo — hasta entonces se excluye a propósito.
const street: string | null = null

// Fuente de verdad: siteConfig.org / siteConfig.city — el enlace y la
// dirección mostrada se construyen de los mismos dos campos acá.
const query = `${siteConfig.org} ${siteConfig.city}`

export const ubicacionInfo: UbicacionInfo = {
  venue: siteConfig.org,
  street,
  city: siteConfig.city,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
}
