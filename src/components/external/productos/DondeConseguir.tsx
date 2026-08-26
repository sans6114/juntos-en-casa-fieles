import { CtaButton, SectionHeading } from "@/components/external/shared"

export function DondeConseguir() {
  return (
    <section className="campo-fuego px-6 py-20 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="max-w-2xl">
          <SectionHeading eyebrow="Cómo conseguirlas" title="Se venden solo en el stand" />
          <p className="mt-5 text-pretty text-base font-medium leading-relaxed md:text-lg">
            No hay venta online: los productos se consiguen únicamente en el stand de JEC,
            durante los tres días de la conferencia.
          </p>
          <p className="jec-mono mt-4 text-sm font-bold uppercase tracking-[0.14em]">
            18, 19 y 20 de septiembre · La Plata
          </p>
        </div>

        <CtaButton href="/inscripcion" className="shrink-0">
          Inscribirme
        </CtaButton>
      </div>
    </section>
  )
}
