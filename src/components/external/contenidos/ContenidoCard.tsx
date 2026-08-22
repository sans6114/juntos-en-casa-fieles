import type { ContenidoItem } from "./data"

const KIND_LABEL: Record<ContenidoItem["kind"], string> = {
  podcast: "Podcast",
  evento: "Evento",
}

type ContenidoCardProps = {
  item: ContenidoItem
}

export function ContenidoCard({ item }: ContenidoCardProps) {
  return (
    <article className="flex h-full flex-col bg-[var(--jec-ink-soft)] p-6 md:p-8">
      <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--jec-amber)]">
        {KIND_LABEL[item.kind]}
      </p>
      <h3 className="jec-label mt-3 text-2xl font-extrabold tracking-tight text-[var(--jec-bone)] md:text-3xl">
        {item.title}
      </h3>
      <p className="mt-6 border-t border-[var(--jec-bone)]/10 pt-6 text-sm leading-relaxed text-[var(--jec-smoke)] md:text-base">
        {item.description}
      </p>
    </article>
  )
}
