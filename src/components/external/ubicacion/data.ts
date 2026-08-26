import { siteConfig } from "@/lib/seo/site"

export type UbicacionInfo = {
  venue: string
  /**
   * `null` mientras no haya dirección confirmada. La vista lo marca como dato
   * pendiente con `PlaceholderTag`, así el estado vive en el tipo y no en una
   * cadena que dice "(placeholder)" y que algún día se olvida de limpiar.
   *
   * Es la ÚNICA fuente de la dirección en toda la superficie pública: el FAQ
   * también lee de acá, así que la contradicción entre ambas secciones no se
   * puede reintroducir.
   */
  street: string | null
  city: string
  mapsUrl: string
}

// Dirección de calle confirmada. Volver a `null` la deja pendiente en las dos
// secciones a la vez, sin tocar ninguna vista.
const streetAddress: string | null = "Calle 23, 1665 entre 66 y 67"

// Referencia de barrio: ayuda a orientarse, pero se deja fuera del `query` de
// Maps porque ahí solo agrega ruido al geocoding.
const landmark = "Zona Parque Castelli"

const street = streetAddress ? `${streetAddress} — ${landmark}` : null

// Fuente de verdad: siteConfig.org / siteConfig.city más la dirección de calle.
// El enlace y la dirección mostrada se construyen de los mismos campos.
const query = [siteConfig.org, streetAddress, siteConfig.city].filter(Boolean).join(" ")

export const ubicacionInfo: UbicacionInfo = {
  venue: siteConfig.org,
  street,
  city: siteConfig.city,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
}
