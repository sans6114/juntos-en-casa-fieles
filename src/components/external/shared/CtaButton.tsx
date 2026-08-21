import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

type CtaButtonVariant = "solid" | "pill"

type CtaButtonBase = {
  children: ReactNode
  className?: string
  /** "solid" (default, esquinas rectas) | "pill" (bordes redondeados, botón reutilizable) */
  variant?: CtaButtonVariant
}

type CtaButtonLinkProps = CtaButtonBase & {
  as?: "link"
  href: string
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">

type CtaButtonAsButtonProps = CtaButtonBase & {
  as: "button"
  href?: never
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">

export type CtaButtonProps = CtaButtonLinkProps | CtaButtonAsButtonProps

const variantClassName: Record<CtaButtonVariant, string> = {
  solid: "rounded-[6px]",
  pill: "rounded-full",
}

const baseClassName =
  "jec-label inline-flex items-center justify-center bg-[var(--cta-bg)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--cta-fg)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--regla)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none md:px-10 md:py-4 md:text-base"

export function CtaButton(props: CtaButtonProps) {
  const { children, className, variant = "solid" } = props
  const sharedClassName = cn(baseClassName, variantClassName[variant], className)

  if (props.as === "button") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- narrowing the union strips these keys from buttonProps
    const { as, href, children: _children, className: _className, variant: _variant, ...buttonProps } = props
    return (
      <button type="button" {...buttonProps} className={sharedClassName}>
        {children}
      </button>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- narrowing the union strips these keys from linkProps
  const { as, href, children: _children, className: _className, variant: _variant, ...linkProps } = props
  return (
    <Link href={href} {...linkProps} className={sharedClassName}>
      {children}
    </Link>
  )
}
