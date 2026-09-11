import type { Metadata } from "next"
import { obtenerCongregaciones } from "@/actions"
import { SiteFooter, SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

import { InscripcionAside } from "./ui/InscripcionAside"
import { InscripcionCard } from "./ui/InscripcionCard"
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

      <main id="contenido" tabIndex={-1}>
        <section className="campo-papel px-6 pb-24 pt-6 md:px-10 md:pb-28 lg:px-16">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_552px] lg:gap-16">
            <InscripcionAside />

            <InscripcionCard
              titulo="Tus datos"
              subtitulo="Todos los campos son obligatorios salvo los marcados."
            >
              <InscripcionForm congregaciones={congregaciones} />
            </InscripcionCard>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
