import type { Metadata } from "next"

import {
  ContenidosGrid,
  ContenidosIntro,
  type ContenidoKind,
} from "@/components/external/contenidos"
import { Galeria } from "@/components/external/galeria"
import { CtaButton, SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

export const metadata: Metadata = createPageMetadata({
  path: "/contenidos",
  title: "Contenidos",
})

const KINDS: ContenidoKind[] = ["predica", "podcast", "recurso"]

function parseTipo(value: string | string[] | undefined): ContenidoKind | undefined {
  return KINDS.find((kind) => kind === value)
}

type ContenidosPageProps = {
  searchParams: Promise<{ tipo?: string | string[] }>
}

export default async function ContenidosPage({ searchParams }: ContenidosPageProps) {
  const { tipo } = await searchParams

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />
      <ContenidosIntro />
      <ContenidosGrid tipo={parseTipo(tipo)} />
      <Galeria />

      <section className="campo-fuego px-6 py-20 md:px-10 md:py-24 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-2xl">
            <h2 className="jec-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
              ¿Te lo perdiste?
            </h2>
            <p className="mt-5 text-pretty text-base font-medium leading-relaxed md:text-lg">
              JEC 2026 ya tiene fecha: 18, 19 y 20 de septiembre en Iglesia cristiana Vida
              Sobrenatural, La Plata.
            </p>
          </div>
          <CtaButton href="/inscripcion" className="shrink-0">
            Inscribirme
          </CtaButton>
        </div>
      </section>
    </>
  )
}
