import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  className?: string
  align?: "left" | "center"
  as?: "h2" | "h3"
}

export function SectionHeading({
  eyebrow,
  title,
  className,
  align = "left",
  as: TitleTag = "h2",
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {eyebrow ? (
        <p className="jec-label mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[var(--jec-amber)] md:mb-4 md:text-sm">
          {eyebrow}
        </p>
      ) : null}
      <TitleTag className="jec-label text-3xl font-extrabold tracking-tight text-[var(--jec-bone)] md:text-4xl lg:text-5xl">
        {title}
      </TitleTag>
    </header>
  )
}
