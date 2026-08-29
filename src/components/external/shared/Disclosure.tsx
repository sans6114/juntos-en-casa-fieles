import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DisclosureProps = {
  summary: ReactNode
  children: ReactNode
  className?: string
  defaultOpen?: boolean
}

export function Disclosure({ summary, children, className, defaultOpen = false }: DisclosureProps) {
  return (
    <details className={cn("jec-disclosure", className)} open={defaultOpen || undefined}>
      <summary className="jec-label">{summary}</summary>
      {children}
    </details>
  )
}
