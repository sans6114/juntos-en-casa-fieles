import type { CronogramaDia } from "./data"

type CronogramaDiaCardProps = {
  dia: CronogramaDia
}

export function CronogramaDiaCard({ dia }: CronogramaDiaCardProps) {
  return (
    <article className="flex h-full flex-col border border-[var(--linea)] p-6 md:p-8">
      <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento)]">
        {dia.dayLabel}
      </p>
      <h3 className="jec-label mt-3 text-2xl font-extrabold tracking-tight text-[var(--dato)] md:text-3xl">
        {dia.title}
      </h3>
      <ul className="mt-8 flex flex-col gap-4 border-t border-[var(--linea)] pt-6">
        {dia.items.map((item) => (
          <li
            key={`${dia.id}-${item.time}-${item.label}`}
            className="grid grid-cols-[4.5rem_1fr] gap-3 text-sm md:text-base"
          >
            <time
              dateTime={item.time}
              className="jec-label font-bold tabular-nums text-[var(--acento)]"
            >
              {item.time}
            </time>
            <span className="text-[var(--suave)]">{item.label}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
