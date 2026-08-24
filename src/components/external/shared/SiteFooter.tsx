import Link from "next/link"

import { siteConfig } from "@/lib/seo/site"
import { cn } from "@/lib/utils"

import { navItems, socialLinks } from "./navigation"

const footerLinkClass =
  "jec-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--dato)] transition-colors hover:text-[var(--acento)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"

type SiteFooterProps = {
  className?: string
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        // Reserva inferior: cubre la CTA fija de móvil + safe area de iOS (misma --jec-cta-h que consume la barra).
        // En md+ la barra no existe, así que el padding vuelve a uno tipico de sección.
        "campo-fuego px-6 pt-16 pb-[calc(var(--jec-cta-h)+env(safe-area-inset-bottom,0px))] md:px-10 md:pt-20 md:pb-12",
        className
      )}
    >
      <nav
        aria-label="Secciones"
        className="flex flex-wrap items-center gap-x-7 gap-y-3"
      >
        {/* El footer ignora `essential` (es un hint de densidad del header): acá van todos los destinos. */}
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={footerLinkClass}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sin URLs reales todavía: mientras socialLinks esté vacío no se renderiza ninguna sección social. */}
      {socialLinks.length > 0 && (
        <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          {socialLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className={footerLinkClass}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="jec-label mt-10 text-xs text-[var(--suave)]">
        © {siteConfig.year} {siteConfig.name}
      </p>
    </footer>
  )
}
