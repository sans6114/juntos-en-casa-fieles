import { CtaButton, SectionHeading } from "@/components/external/shared"

import { MapaSimulado } from "./MapaSimulado"
import { ubicacionInfo } from "./data"

export function Ubicacion() {
  return (
    <section
      id="ubicacion"
      aria-label="Ubicación"
      className="campo-papel jec-anchor px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Encontranos"
          title="Ubicación"
          className="mb-12 md:mb-16"
        />

        <div className="flex max-w-xl flex-col gap-8 md:gap-10">
          <address className="not-italic">
            <p className="jec-label text-xl font-extrabold tracking-tight text-[var(--dato)] md:text-2xl">
              {ubicacionInfo.venue}
            </p>
            <p className="mt-3 text-sm text-[var(--suave)] md:text-base">
              {ubicacionInfo.street}
            </p>
            <p className="mt-2 text-base text-[var(--dato)] md:text-lg">
              {ubicacionInfo.city}
            </p>
          </address>

          <MapaSimulado />

          <CtaButton href={ubicacionInfo.mapsUrl}>Cómo llegar</CtaButton>
        </div>
      </div>
    </section>
  )
}
