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
  { href: "/contenidos", label: "Contenidos" },
  { href: "/inscripcion", label: "Inscribirme", cta: true },
]

/** Sin URLs reales en el repo todavía; el footer de landing-home-secciones no renderiza nada mientras esté vacío. */
export const socialLinks: readonly SocialLink[] = []
