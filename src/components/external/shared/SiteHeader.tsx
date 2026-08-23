import Image from "next/image"
import Link from "next/link"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"
import { navItems } from "./navigation"

const navLinkClass =
  "jec-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--dato)] transition-colors hover:text-[var(--acento)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"

const logoSrc = {
  light: jecAssets.logos.wordmarkWhite,
  dark: jecAssets.logos.wordmarkBlack,
} as const

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

      <nav aria-label="Secciones" className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 md:gap-x-7">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(navLinkClass, !item.essential && "hidden md:inline")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
