import { CtaButton, PlaceholderTag, SectionHeading } from "@/components/external/shared"

import { MapaSimulado } from "./MapaSimulado"
import { ubicacionInfo } from "./data"

const fieldLabelClass =
  "jec-label text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--suave)]"

export function Ubicacion() {
  return (
    <section
      id="ubicacion"
      aria-label="Ubicación"
      className="campo-papel jec-anchor px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Encontranos" title="Ubicación" className="mb-12 md:mb-16" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
          <div className="flex flex-col items-start">
            {/*
              El label de acento separa al venue del <h2> de SectionHeading, que comparte
              familia, peso y tracking. Es el mismo recurso que `dayLabel` en CronogramaDiaCard.
            */}
            <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]">
              El lugar
            </p>

            <h3 className="jec-label mt-3 text-2xl font-extrabold tracking-tight text-[var(--dato)] md:text-3xl">
              {ubicacionInfo.venue}
            </h3>

            <address className="mt-7 flex w-full flex-col gap-6 border-t border-[var(--linea)] pt-6 not-italic">
              <div className="flex flex-col items-start gap-2">
                <p className={fieldLabelClass}>Dirección</p>
                {ubicacionInfo.street ? (
                  <p className="text-base leading-relaxed text-[var(--dato)]">
                    {ubicacionInfo.street}
                  </p>
                ) : (
                  <PlaceholderTag>Dirección por confirmar</PlaceholderTag>
                )}
              </div>

              <div className="flex flex-col items-start gap-2">
                <p className={fieldLabelClass}>Ciudad</p>
                <p className="text-base leading-relaxed text-[var(--dato)]">{ubicacionInfo.city}</p>
              </div>
            </address>

            <CtaButton href={ubicacionInfo.mapsUrl} className="mt-8">
              Cómo llegar
            </CtaButton>
          </div>

          <MapaSimulado />
        </div>
      </div>
    </section>
  )
}
