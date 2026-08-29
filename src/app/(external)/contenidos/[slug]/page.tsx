import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { obtenerContenidoPorSlug, obtenerContenidosRelacionados } from "@/actions"
import { ContenidoCard } from "@/components/external/contenidos"
import {
  ArrowLeftIcon,
  BrandName,
  ClockIcon,
  CtaButton,
  PlaceholderTag,
  SectionHeading,
  SiteFooter,
  SiteHeader,
} from "@/components/external/shared"
import { kindLabel } from "@/interfaces/contenido"
import { createPageMetadata } from "@/lib/seo/site"

import { PlacasDownload } from "./ui/PlacasDownload"
import { VideoEmbed } from "./ui/VideoEmbed"

type ContenidoPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ContenidoPageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await obtenerContenidoPorSlug(slug)

  if (!item) return createPageMetadata({ path: `/contenidos/${slug}` })

  return createPageMetadata({
    path: `/contenidos/${item.slug}`,
    title: item.title,
    description: item.description,
  })
}

export default async function ContenidoPage({ params }: ContenidoPageProps) {
  const { slug } = await params
  const item = await obtenerContenidoPorSlug(slug)

  if (!item) notFound()

  const relacionados = await obtenerContenidosRelacionados(item.slug)

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <section className="campo-papel px-6 pb-10 pt-4 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/contenidos"
              className="jec-label inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--suave)] transition-colors hover:text-[var(--dato)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"
            >
              <ArrowLeftIcon size={16} />
              Volver a contenidos
            </Link>

            <h1 className="jec-label mt-6 max-w-4xl text-pretty text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <BrandName>{item.title}</BrandName>
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]">
                {item.session ? `${kindLabel(item.kind)} · ${item.session}` : kindLabel(item.kind)}
              </span>

              {item.speaker ? (
                <span className="jec-mono text-sm font-bold uppercase tracking-[0.14em] text-[var(--suave)]">
                  {item.speaker}
                </span>
              ) : item.kind === "predica" ? (
                <PlaceholderTag>Orador a confirmar</PlaceholderTag>
              ) : null}

              <span className="jec-mono text-sm font-bold uppercase tracking-[0.14em] text-[var(--suave)]">
                <BrandName>Juntos En Casa</BrandName> {item.edition}
              </span>

              {item.durationLabel ? (
                <span className="jec-mono inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[var(--suave)]">
                  <ClockIcon size={16} />
                  {item.durationLabel}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="campo-papel px-6 pb-24 md:px-10 md:pb-28 lg:px-16">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_368px]">
            <div className="flex min-w-0 flex-col gap-10">
              <VideoEmbed item={item} />

              <div className="border-t-[3px] border-[var(--regla)] pt-10">
                <p className="jec-label jec-eyebrow mb-4 text-xs font-bold uppercase tracking-[0.28em] md:text-sm">
                  Sobre este contenido
                </p>
                <p className="max-w-2xl text-pretty text-base leading-[1.75] text-[var(--suave)] md:text-lg">
                  <BrandName>{item.description}</BrandName>
                </p>
              </div>
            </div>

            <aside className="flex min-w-0 flex-col gap-5">
              <PlacasDownload item={item} />

              <div className="campo-fuego rounded-[6px] p-7">
                {/* jec-label, no jec-display: la build personal-use de Cayento mapea
                    los diez dígitos al mismo glifo de marca de agua. Sin números en display. */}
                {/* `leading-[1.05]` y no `leading-none`: con el nombre completo
                    el bloque ocupa dos líneas en el ancho del aside, y a
                    interlineado 1 las dos se tocan. */}
                <p className="jec-label text-3xl font-extrabold leading-[1.05] tracking-tight">
                  <BrandName>Juntos En Casa</BrandName> 2026
                </p>
                <p className="mt-3 text-[15px] font-medium leading-relaxed">
                  18, 19 y 20 de septiembre · La Plata
                </p>
                <CtaButton href="/inscripcion" className="mt-5 w-full px-6 py-3.5 text-sm">
                  Inscribirme
                </CtaButton>
              </div>
            </aside>
          </div>
        </section>

        {relacionados.length > 0 ? (
          <section
            aria-label="Más contenidos"
            className="campo-tinta px-6 py-20 md:px-10 md:py-24 lg:px-16"
          >
            <div className="mx-auto max-w-6xl">
              <SectionHeading eyebrow="Seguí mirando" title="Más contenidos" className="mb-10" />
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((relacionado) => (
                  <ContenidoCard key={relacionado.id} item={relacionado} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  )
}
