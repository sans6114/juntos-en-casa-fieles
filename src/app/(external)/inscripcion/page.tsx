import type { Metadata } from "next"
import { obtenerCongregaciones } from "@/actions"
import { SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

import { InscripcionAside } from "./ui/InscripcionAside"
import { InscripcionForm } from "./ui/InscripcionForm"

export const metadata: Metadata = createPageMetadata({
  title: "Inscripción",
  path: "/inscripcion",
})

export default async function InscripcionPage() {
  const congregaciones = await obtenerCongregaciones()

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <section className="campo-papel px-6 pb-24 pt-6 md:px-10 md:pb-28 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_552px] lg:gap-16">
          <InscripcionAside />

          <div className="min-w-0 rounded-[6px] border border-[var(--linea)] border-t-[3px] border-t-[var(--regla)] p-6 sm:p-10">
            <h2 className="jec-label text-2xl font-extrabold tracking-tight">Tus datos</h2>
            <p className="mt-2 text-[15px] text-[var(--suave)]">
              Todos los campos son obligatorios salvo los marcados.
            </p>

            <div className="mt-8">
              <InscripcionForm congregaciones={congregaciones} />
            </div>

            <p className="mt-6 text-center text-[13px] leading-relaxed text-[var(--suave)]">
              Usamos tus datos solo para organizar la conferencia y contactarte.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
