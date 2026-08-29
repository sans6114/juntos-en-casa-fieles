import type { Metadata } from "next"

import { obtenerContenidosPublicos } from "@/actions"
import { ContenidosGrid, ContenidosIntro } from "@/components/external/contenidos"
import { Galeria } from "@/components/external/galeria"
import { BrandName, CtaButton, SiteFooter, SiteHeader } from "@/components/external/shared"
import type { ContenidoKind } from "@/interfaces/contenido"
import { createPageMetadata } from "@/lib/seo/site"

export const metadata: Metadata = createPageMetadata({
  path: "/contenidos",
  title: "Contenidos",
})

const KINDS: ContenidoKind[] = ["predica", "video", "recursos"]

function parseTipo(value: string | string[] | undefined): ContenidoKind | undefined {
  return KINDS.find((kind) => kind === value)
}

type ContenidosPageProps = {
  searchParams: Promise<{ tipo?: string | string[] }>
}

export default async function ContenidosPage({ searchParams }: ContenidosPageProps) {
  const { tipo: tipoParam } = await searchParams
  const tipo = parseTipo(tipoParam)

  const items = await obtenerContenidosPublicos(tipo)
  /**
   * Distingue las dos vacías posibles (nueva, no cubierta por el diseño):
   * catálogo entero sin publicar todavía (D15: la migración inicial deja los
   * seis rescatados en `publicado: false`) vs. un filtro de tipo que
   * simplemente no tiene coincidencias. Solo se hace una segunda consulta
   * cuando el filtro activo devolvió cero — el caso común (hay contenidos)
   * queda en una sola query.
   */
  const catalogoVacio =
    items.length === 0 && (tipo ? (await obtenerContenidosPublicos()).length === 0 : true)

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <ContenidosIntro />
        <ContenidosGrid tipo={tipo} items={items} catalogoVacio={catalogoVacio} />
        <Galeria />

        <section className="campo-fuego px-6 py-20 md:px-10 md:py-24 lg:px-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <h2 className="jec-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
                ¿Te lo perdiste?
              </h2>
              <p className="mt-5 text-pretty text-base font-medium leading-relaxed md:text-lg">
                <BrandName>Juntos En Casa</BrandName> 2026 ya tiene fecha: 18, 19 y 20 de
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
