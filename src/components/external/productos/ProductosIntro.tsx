import Image from "next/image"
import { BrandName } from "@/components/external/shared"
import { jecAssets } from "@/lib/jec-assets"

export function ProductosIntro() {
  return (
    <section className="campo-papel px-6 pb-12 pt-10 md:px-10 md:pb-12 md:pt-16 lg:px-16">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-16">
        <div className="min-w-0 max-w-2xl">
          <p className="jec-label jec-eyebrow mb-3 text-xs font-bold uppercase tracking-[0.28em] md:mb-4 md:text-sm">
            Llevate el fuego
          </p>
          <h1 className="jec-display text-4xl leading-[0.92] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
            Productos
          </h1>
          <p className="mt-6 text-pretty text-base leading-relaxed text-[var(--suave)] md:text-lg">
            Lo que vas a poder llevarte de <BrandName>Juntos En Casa</BrandName>: remera y
            stickers, disponibles solo en el stand del evento.
          </p>
        </div>

        <Image
          src={jecAssets.personaje.festejando}
          alt=""
          width={190}
          height={253}
          className="hidden w-[190px] shrink-0 lg:block"
        />
      </div>
    </section>
  )
}
