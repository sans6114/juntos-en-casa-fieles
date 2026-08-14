import { SectionHeading } from "@/components/external/shared"

import { CronogramaDiaCard } from "./CronogramaDiaCard"
import { cronogramaDias } from "./data"

export function Cronograma() {
  return (
    <section
      id="cronograma"
      aria-label="Cronograma"
      className="bg-[var(--jec-ink)] px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Programa"
          title="Cronograma"
          className="mb-12 md:mb-16"
        />
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {cronogramaDias.map((dia) => (
            <CronogramaDiaCard key={dia.id} dia={dia} />
          ))}
        </div>
      </div>
    </section>
  )
}
