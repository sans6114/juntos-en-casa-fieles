export type NavItem = {
  href: string
  label: string
  /** Hint de densidad de header: true = visible en todo breakpoint, false = oculto bajo md */
  essential: boolean
}

export type SocialLink = {
  href: string
  label: string
  handle: string
}

export const navItems: readonly NavItem[] = [
  { href: "/#cronograma", label: "Cronograma", essential: false },
  { href: "/#invitados", label: "Invitados", essential: false },
  { href: "/#ubicacion", label: "Ubicación", essential: false },
  { href: "/contenidos", label: "Contenidos", essential: true },
  { href: "/#inscripcion", label: "Inscribirme", essential: true },
]

/** Sin URLs reales en el repo todavía; el footer de landing-home-secciones no renderiza nada mientras esté vacío. */
export const socialLinks: readonly SocialLink[] = []
