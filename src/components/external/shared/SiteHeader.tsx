import Image from "next/image"
import Link from "next/link"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"
import { CloseIcon, MenuIcon } from "./icons"
import { navItems } from "./navigation"

const navLinkClass =
  "jec-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--dato)] transition-colors hover:text-[var(--acento-texto)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"

const logoSrc = {
  light: jecAssets.logos.wordmarkWhite,
  dark: jecAssets.logos.wordmarkBlack,
} as const

/**
 * Closing the menu points at a fragment that matches NOTHING. The browser sets
 * the fragment, finds no target, does not scroll, and `#menu-movil` stops being
 * `:target` — so the panel closes exactly where the reader was standing.
 * `href="#"` would jump to the top of the document instead.
 */
const CLOSE_HREF = "#menu-cerrado"

type SiteHeaderProps = {
  className?: string
  logo?: keyof typeof logoSrc
}

export function SiteHeader({ className, logo = "light" }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "relative z-10 flex items-center justify-between gap-4 px-6 pt-6 md:px-10 md:pt-8",
        className
      )}
    >
      <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Inicio">
        <Image
          src={logoSrc[logo]}
          alt="Juntos en Casa"
          width={40}
          height={40}
          className="h-8 w-auto md:h-10"
        />
      </Link>

      <nav
        aria-label="Secciones"
        className="hidden items-center justify-end gap-x-5 gap-y-2 md:flex md:flex-wrap md:gap-x-7"
      >
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClass}>
            {item.label}
          </Link>
        ))}
      </nav>

      <a
        href="#menu-movil"
        aria-label="Abrir menú"
        className="-mr-2 inline-flex size-11 items-center justify-center text-[var(--dato)] transition-colors hover:text-[var(--acento-texto)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)] md:hidden"
      >
        <MenuIcon size={24} />
      </a>

      {/*
        Panel `:target`, sin una línea de JavaScript. Los enlaces son <a> planos
        a propósito: <Link> navega con history.pushState, y pushState no
        actualiza el target element del documento, así que el panel quedaría
        abierto encima de la sección a la que acabás de saltar.
      */}
      <div id="menu-movil" className="jec-menu-movil campo-tinta">
        <div className="flex items-center justify-between gap-4 px-6 pt-6">
          <Image
            src={jecAssets.logos.wordmarkWhite}
            alt="Juntos en Casa"
            width={40}
            height={40}
            className="h-8 w-auto"
          />
          <a
            href={CLOSE_HREF}
            aria-label="Cerrar menú"
            className="-mr-2 inline-flex size-11 items-center justify-center text-[var(--dato)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)]"
          >
            <CloseIcon size={24} />
          </a>
        </div>

        <nav aria-label="Secciones" className="flex flex-col gap-1 px-6 pb-10 pt-8">
          {navItems.map((item) =>
            item.cta ? (
              <a
                key={item.href}
                href={item.href}
                className="jec-label mt-5 inline-flex min-h-14 items-center justify-center rounded-[6px] bg-[var(--cta-bg)] px-8 text-sm font-bold uppercase tracking-[0.14em] text-[var(--cta-fg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="jec-label flex min-h-14 items-center border-b border-[var(--linea)] text-2xl font-extrabold tracking-tight text-[var(--dato)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"
              >
                {item.label}
              </a>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
