import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PlaceholderTagProps = {
  children: ReactNode
  className?: string
}

/**
 * Marks a value as placeholder in the RENDERED text, not only in a code comment,
 * so nothing ships looking like confirmed content. The hatched fill makes it read
 * as unfinished at a glance; the outline keeps it legible on any field.
 */
export function PlaceholderTag({ children, className }: PlaceholderTagProps) {
  return (
    <span
      className={cn(
        "jec-label jec-placeholder inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--dato)]",
        className
      )}
    >
      {children}
    </span>
  )
}
