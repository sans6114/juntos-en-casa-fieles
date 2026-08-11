import { SectionHeading } from "@/components/external/shared"

import { ContenidoCard } from "./ContenidoCard"
import { contenidos } from "./data"

export function ContenidosGrid() {
  return (
    <section
      aria-label="Contenidos"
      className="bg-[var(--jec-ink)] px-6 py-16 md:px-10 md:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Explorá"
          title="Contenidos"
          className="mb-12 md:mb-16"
        />
        <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {contenidos.map((item) => (
            <ContenidoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
