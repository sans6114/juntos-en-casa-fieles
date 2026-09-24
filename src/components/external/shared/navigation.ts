export type NavItem = {
  href: string
  label: string
  /** Primary action. Rendered as a CTA instead of a plain link, at every breakpoint. */
  cta?: boolean
}

export type SocialLink = {
  href: string
  label: string
  handle: string
}

/**
 * Every entry renders at every breakpoint: below `md` inside the `:target`
 * menu panel, from `md` up in the header's inline nav. There is no
 * "essential" subset any more — hiding links below `md` left the landing's
 * own sections unreachable on phones.
 */
export const navItems: readonly NavItem[] = [
  { href: "/#cronograma", label: "Cronograma" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/productos", label: "Productos" },
  // Pasa a ser LA acción del sitio ahora que el evento terminó: es el único
  // lugar donde queda algo por hacer.
  { href: "/contenidos", label: "Contenidos", cta: true },
  // "Mi QR" e "Inscribirme" salieron del nav el 24/09. El evento fue el 18, 19
  // y 20: el QR ya no abre ninguna puerta y una inscripción nueva sería para un
  // evento que no existe.
  //
  // OJO: solo salieron del NAV. `/mi-qr/<token>` sigue viva a propósito, porque
  // ese link viajó en los 546 WhatsApps y mails que ya se mandaron y romperlos
  // sería convertir historial ajeno en 404.
]

/**
 * La acción que reemplaza a "Inscribirme" en todo el sitio.
 *
 * Vive acá y no repetida en cada componente porque son CUATRO lugares —hero,
 * barra móvil, ficha de producto y "dónde conseguirlas"— y cuatro copias del
 * mismo texto se desincronizan a la primera que alguien cambie una.
 *
 * Dice "Ver las prédicas" y no "Ver lo que pasó" porque nombra lo que la
 * persona va a encontrar. Si más adelante se suben fotos o resúmenes, cambiar
 * la etiqueta acá alcanza para que cambie en los cuatro lados.
 */
export const ACCION_POST_EVENTO = {
  href: "/contenidos",
  label: "Ver las prédicas",
} as const

/** Sin URLs reales en el repo todavía; el footer de landing-home-secciones no renderiza nada mientras esté vacío. */
export const socialLinks: readonly SocialLink[] = [
  { href: "https://www.instagram.com/juntosencasa.ivs/?hl=es", label: "Instagram", handle: "juntosencasa.ivs" },
  { href: "https://www.youtube.com/@juntosencasaivs", label: "YouTube", handle: "@juntosencasaivs" },
]
