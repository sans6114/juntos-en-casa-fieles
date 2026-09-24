import type { Metadata } from "next"

import { SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

import { RecuperarQrFlow } from "./ui/RecuperarQrFlow"

export const metadata: Metadata = createPageMetadata({
  title: "Recuperá tu QR",
  path: "/mi-qr",
  // Buscar por email es, inevitablemente, una forma de averiguar quién está
  // inscripto. Que la página no se indexe no lo impide, pero evita que quede
  // servida en buscadores a quien no la estaba buscando.
  noIndex: true,
})

/**
 * Ya no pide las congregaciones. Se traían para que revelar el formulario de
 * inscripción —el que aparecía cuando el email no existía— no costara un
 * segundo viaje al servidor. Cerrado ese camino al terminar el evento, la
 * consulta quedó alimentando a nadie.
 */
export default function MiQrPage() {
  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <section className="campo-papel px-6 pb-24 pt-6 md:px-10 md:pb-28 lg:px-16">
          <div className="mx-auto max-w-xl">
            <RecuperarQrFlow />
          </div>
        </section>
      </main>
    </>
  )
}
