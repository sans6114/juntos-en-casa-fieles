import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type CtaButtonVariant = "solid" | "pill"

type CtaButtonProps = {
  href: string
  children: ReactNode
  className?: string
  /** "solid" (default, esquinas rectas) | "pill" (bordes redondeados, botón reutilizable) */
  variant?: CtaButtonVariant
}

const variantClassName: Record<CtaButtonVariant, string> = {
  solid: "",
  pill: "rounded-full",
}

export function CtaButton({ href, children, className, variant = "solid" }: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "jec-label inline-flex items-center justify-center bg-[var(--jec-ember)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--jec-bone)] transition-colors hover:bg-[var(--jec-amber)] hover:text-[var(--jec-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)] md:px-10 md:py-4 md:text-base",
        variantClassName[variant],
        className
      )}
    >
      {children}
    </Link>
  )
}
