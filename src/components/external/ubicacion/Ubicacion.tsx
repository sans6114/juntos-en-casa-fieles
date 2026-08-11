import { CtaButton, SectionHeading } from "@/components/external/shared"
import { siteConfig } from "@/lib/seo/site"

/** Street line is unknown; marked until a real address is confirmed. */
const STREET_PLACEHOLDER = "Dirección por confirmar (placeholder)"

const mapsQuery = `${siteConfig.org} La Plata`
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`

export function Ubicacion() {
  return (
    <section
      id="ubicacion"
      aria-label="Ubicación"
      className="bg-[var(--jec-ink)] px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Encontranos"
          title="Ubicación"
          className="mb-12 md:mb-16"
        />

        <div className="flex max-w-xl flex-col gap-8 md:gap-10">
          <address className="not-italic">
            <p className="jec-display text-xl font-extrabold tracking-tight text-[var(--jec-bone)] md:text-2xl">
              {siteConfig.org}
            </p>
            <p className="mt-3 text-sm text-[var(--jec-smoke)] md:text-base">
              {STREET_PLACEHOLDER}
            </p>
            <p className="mt-2 text-base text-[var(--jec-bone)]/90 md:text-lg">
              {siteConfig.city}
            </p>
          </address>

          <CtaButton href={mapsUrl}>Cómo llegar</CtaButton>
        </div>
      </div>
    </section>
  )
}
