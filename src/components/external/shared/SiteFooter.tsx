import Image from "next/image"
import Link from "next/link"

import { jecAssets } from "@/lib/jec-assets"
import { siteConfig } from "@/lib/seo/site"
import { cn } from "@/lib/utils"

import { CtaButton } from "./CtaButton"
import { navItems, socialLinks } from "./navigation"

/**
 * El hover no puede depender del color acá. `campo-fuego` define `--dato`,
 * `--suave` y `--acento` con el mismo ink, así que `hover:text-[var(--acento)]`
 * no cambia absolutamente nada en ese campo. La regla inferior de 3px se dibuja
 * con `--regla`, que por definición contrasta con `--sup` en los tres campos:
 * un único mecanismo, sin lógica condicional por campo.
 */
const footerLinkClass =
  "jec-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--dato)] transition-shadow hover:shadow-[inset_0_-3px_0_0_var(--regla)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"

const columnLabelClass =
  "jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--suave)]"

type SiteFooterProps = {
  className?: string
}

export function SiteFooter({ className }: SiteFooterProps) {
  // Se renderizan todas las entradas de navItems: las de sección como enlaces,
  // la marcada `cta` como acción. Ninguna se filtra.
  const sectionItems = navItems.filter((item) => !item.cta)
  const ctaItem = navItems.find((item) => item.cta)

  return (
    <footer
      className={cn(
        // Sin reserva para la CTA: `StickyCta` es `sticky`, no `fixed`, así que al
        // final de la página aterriza en flujo debajo del footer y no lo tapa.
        // El padding inferior solo respeta la safe area de iOS.
        "campo-tinta px-6 pt-16 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] md:px-10 md:pt-20 md:pb-12",
        className
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.3fr_1fr_1fr] md:gap-16">
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Inicio">
            <Image
              src={jecAssets.logos.wordmarkWhite}
              alt={siteConfig.name}
              width={80}
              height={80}
              className="h-16 w-auto md:h-20"
            />
          </Link>
          {/* Identidad estructural, no un lema: los dos valores salen de siteConfig. */}
          <p className="text-[15px] leading-relaxed text-[var(--suave)]">
            {siteConfig.org}
            <br />
            {siteConfig.city}
          </p>
        </div>

        <nav aria-label="Secciones" className="flex flex-col items-start gap-3.5">
          <p className={columnLabelClass}>Secciones</p>
          {sectionItems.map((item) => (
            <Link key={item.href} href={item.href} className={footerLinkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        {ctaItem ? (
          <div className="flex flex-col items-start gap-4">
            <p className={columnLabelClass}>Sumate</p>
            <CtaButton href={ctaItem.href}>{ctaItem.label}</CtaButton>
          </div>
        ) : null}
      </div>

      {/* Sin URLs reales todavía: mientras socialLinks esté vacío no se renderiza ninguna sección social. */}
      {socialLinks.length > 0 && (
        <ul className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2">
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

      <div className="mx-auto mt-12 max-w-6xl border-t-[3px] border-[var(--regla)] pt-6 md:mt-16">
        <p className="jec-label text-xs tracking-[0.04em] text-[var(--suave)]">
          © {siteConfig.year} {siteConfig.name}
        </p>
      </div>
    </footer>
  )
}
