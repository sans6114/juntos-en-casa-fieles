import type { Metadata } from "next"
import Image from "next/image"
import { obtenerCongregaciones } from "@/actions"
import { jecAssets } from "@/lib/jec-assets"
import { createPageMetadata } from "@/lib/seo/site"
import { InscripcionForm } from "./ui/InscripcionForm"

export const metadata: Metadata = createPageMetadata({
  title: "Inscripción",
  path: "/inscripcion",
})

export default async function InscripcionPage() {
  const congregaciones = await obtenerCongregaciones()

  return (
    <section className="relative overflow-x-clip px-4 py-16 sm:py-24">
      <div className="relative z-10 mx-auto max-w-xl">
        <header className="mb-10 space-y-3 text-center sm:text-left">
          <p className="jec-label text-xs font-bold uppercase tracking-[0.2em] text-[var(--jec-amber)]">
            Fieles 2026
          </p>
          <h1 className="jec-display text-4xl sm:text-5xl">Sumate a la conferencia</h1>
          <p className="text-[var(--jec-smoke)]">
            Completá tus datos para reservar tu lugar. Te vamos a enviar un email con tu código
            QR de inscripción.
          </p>
        </header>

        <div className="relative border border-[var(--jec-smoke)] bg-[var(--jec-ink-soft)] p-6 sm:p-10">
          <InscripcionForm congregaciones={congregaciones} />

          <Image
            src={jecAssets.personaje.apuntando}
            alt=""
            aria-hidden="true"
            width={375}
            height={500}
            className="pointer-events-none absolute z-20 -top-10 right-2 aspect-[3/4] w-20 select-none object-contain sm:top-auto sm:-right-10 sm:-bottom-12 sm:w-[clamp(8rem,20vw,18rem)]"
          />
        </div>
      </div>
    </section>
  )
}
