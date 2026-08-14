import Image from "next/image"
import Link from "next/link"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"

const navLinkClass =
  "jec-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--jec-bone)] transition-colors hover:text-[var(--jec-amber)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)]"

const NAV_ITEMS = [
  { href: "/#cronograma", label: "Cronograma", essential: false },
  { href: "/#invitados", label: "Invitados", essential: false },
  { href: "/#ubicacion", label: "Ubicación", essential: false },
  { href: "/contenidos", label: "Contenidos", essential: true },
  { href: "/#inscripcion", label: "Inscribirme", essential: true },
] as const

type SiteHeaderProps = {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "relative z-10 flex items-center justify-between gap-4 px-6 pt-6 md:px-10 md:pt-8",
        className
      )}
    >
      <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Inicio">
        <Image
          src={jecAssets.logos.ivsWhite}
          alt="Iglesia Vida Sobrenatural"
          width={40}
          height={40}
          className="h-8 w-auto md:h-10"
        />
      </Link>

      <nav aria-label="Secciones" className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 md:gap-x-7">
        {NAV_ITEMS.map((item) => (
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
