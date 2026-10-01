import {
  ACCION_POST_EVENTO,
  BrandName,
  CtaButton,
  SectionHeading,
} from "@/components/external/shared"
import { siteConfig } from "@/lib/seo/site"

/**
 * Terminado el evento, esta sección dejó de ser una instrucción y pasó a ser un
 * registro: ya no explica cómo comprar, cuenta cómo se vendieron.
 *
 * El año sale de `siteConfig` y no de un literal: "18, 19 y 20 de septiembre"
 * sin año se lee como una fecha que todavía puede venir. Con el año puesto, la
 * misma línea pasa a leerse como lo que es, un dato del pasado — y de paso deja
 * de mentir sola cuando corra el calendario.
 *
 * Los días siguen siendo literales. Si vuelve a haber edición hay que tocarlos
 * acá igual, junto con los verbos.
 */
export function DondeConseguir() {
  return (
    <section className="campo-fuego px-6 py-20 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="max-w-2xl">
          <SectionHeading eyebrow="Cómo se conseguían" title="Se vendieron solo en el stand" />
          <p className="mt-5 text-pretty text-base font-medium leading-relaxed md:text-lg">
            Nunca hubo venta online: los productos se consiguieron únicamente en el stand de{" "}
            <BrandName className="!text-white">Juntos En Casa</BrandName>, durante los tres días de la conferencia.
          </p>
          <p className="jec-mono mt-4 text-sm font-bold uppercase tracking-[0.14em]">
            18, 19 y 20 de septiembre de {siteConfig.year} · La Plata
          </p>
        </div>

        <CtaButton href={ACCION_POST_EVENTO.href} className="shrink-0">
          {ACCION_POST_EVENTO.label}
        </CtaButton>
      </div>
    </section>
  )
}
