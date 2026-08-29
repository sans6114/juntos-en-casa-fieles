import { PlaceholderTag, SectionHeading } from "@/components/external/shared"

import { CronogramaDiaCard } from "./CronogramaDiaCard"
import { cronogramaDias } from "./data"

export function Cronograma() {
  return (
    <section
      id="cronograma"
      aria-label="Cronograma"
      className="campo-papel jec-anchor px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Programa" title="Cronograma" className="mb-6" />

        <p className="mb-12 flex flex-wrap items-center gap-3 md:mb-16">
          <PlaceholderTag>Cronograma tentativo</PlaceholderTag>
          <span className="text-sm text-[var(--suave)]">
            Los horarios todavía se están cerrando. Cuando el programa esté confirmado, lo
            publicamos acá.
          </span>
        </p>
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {cronogramaDias.map((dia) => (
            <CronogramaDiaCard key={dia.id} dia={dia} />
          ))}
        </div>
      </div>
    </section>
  )
}
