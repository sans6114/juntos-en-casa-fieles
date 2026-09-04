import { Suspense } from "react"
import type { Metadata } from "next"

import { obtenerContenidosPublicos } from "@/actions"
import {
  ContenidosCatalogo,
  ContenidosGrid,
  ContenidosIntro,
} from "@/components/external/contenidos"
import { Galeria } from "@/components/external/galeria"
import { BrandName, CtaButton, SiteFooter, SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

export const metadata: Metadata = createPageMetadata({
  path: "/contenidos",
  title: "Contenidos",
})

/**
 * Sin `searchParams` ni ninguna otra API dinámica, esta página se prerenderiza
 * en el build y se sirve como HTML estático: los contenidos cambian poco, y el
 * `revalidatePath("/contenidos")` que ya llamaban las acciones mutadoras recién
 * ahora sirve de algo.
 *
 * El filtro `?tipo=` pasó a `ContenidosCatalogo` (client): leerlo acá volvería
 * la página dinámica otra vez. El `<Suspense>` es obligatorio alrededor de un
 * `useSearchParams`, y su fallback —el catálogo entero, sin filtrar— es
 * exactamente el HTML que se congela en el build.
 */
export default async function ContenidosPage() {
  const items = await obtenerContenidosPublicos()
  // Ya no hace falta la segunda consulta que distinguía "catálogo vacío" de
  // "filtro sin coincidencias": con la lista completa en mano, la primera es
  // simplemente `items.length === 0`.

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <ContenidosIntro />
        <Suspense
          fallback={<ContenidosGrid items={items} catalogoVacio={items.length === 0} />}
        >
          <ContenidosCatalogo items={items} />
        </Suspense>
        <Galeria />

        <section className="campo-fuego px-6 py-20 md:px-10 md:py-24 lg:px-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <h2 className="jec-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
                ¿Te lo perdiste?
              </h2>
              <p className="mt-5 text-pretty text-base font-medium leading-relaxed md:text-lg">
                <BrandName className="!text-white">Juntos En Casa</BrandName> 2026 ya tiene fecha: 18, 19 y 20 de
                septiembre en Iglesia cristiana Vida Sobrenatural, La Plata.
              </p>
            </div>
            <CtaButton href="/inscripcion" className="shrink-0">
              Inscribirme
            </CtaButton>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
