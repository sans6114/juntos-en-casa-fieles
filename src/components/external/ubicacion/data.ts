import { siteConfig } from "@/lib/seo/site"

export type UbicacionInfo = {
  venue: string
  street: string
  city: string
  mapsUrl: string
}

// La calle se excluye de la consulta del enlace mientras siga siendo
// placeholder; sumarla al query cuando haya dirección real confirmada.
const street = "Dirección por confirmar (placeholder)"

// Fuente de verdad: siteConfig.org / siteConfig.city — el enlace y la
// dirección mostrada se construyen de los mismos dos campos acá.
const query = `${siteConfig.org} ${siteConfig.city}`

export const ubicacionInfo: UbicacionInfo = {
  venue: siteConfig.org,
  street,
  city: siteConfig.city,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
}
