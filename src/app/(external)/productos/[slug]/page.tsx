import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  findProducto,
  productos,
  ProductoCard,
  ProductoPieza,
  relatedProductos,
} from "@/components/external/productos"
import {
  ArrowLeftIcon,
  CtaButton,
  PlaceholderTag,
  SectionHeading,
  SiteFooter,
  SiteHeader,
} from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

type ProductoPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return productos.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const { slug } = await params
  const item = findProducto(slug)

  if (!item) return createPageMetadata({ path: `/productos/${slug}` })

  return createPageMetadata({
    path: `/productos/${item.slug}`,
    title: item.title,
    description: item.description,
  })
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { slug } = await params
  const item = findProducto(slug)

  if (!item) notFound()

  const relacionados = relatedProductos(item.slug)

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <section className="campo-papel px-6 pb-10 pt-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/productos"
            className="jec-label inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--suave)] transition-colors hover:text-[var(--dato)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"
          >
            <ArrowLeftIcon size={16} />
            Volver a productos
          </Link>

          <h1 className="jec-label mt-6 max-w-4xl text-pretty text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {item.title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]">
              {item.kicker}
            </span>

            <PlaceholderTag>Precio a confirmar</PlaceholderTag>

            <span className="jec-mono text-sm font-bold uppercase tracking-[0.14em] text-[var(--suave)]">
              Stand del evento
            </span>
          </div>
        </div>
      </section>

      <section className="campo-papel px-6 pb-24 md:px-10 md:pb-28 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_368px]">
          <div className="flex min-w-0 flex-col gap-10">
            <ProductoPieza item={item} size="hero" className="rounded-[6px]" />

            {item.variantes && item.variantes.length > 0 ? (
              <div>
                <p className="jec-label jec-eyebrow mb-4 text-xs font-bold uppercase tracking-[0.28em] md:text-sm">
                  Colores
                </p>
                <div className="grid grid-cols-3 gap-5">
                  {item.variantes.map((variante) => (
                    <div key={variante.id}>
                      <ProductoPieza
                        item={item}
                        variante={variante}
                        className="aspect-square rounded-[6px] border border-[var(--linea)]"
                      />
                      <p className="jec-mono mt-2 text-center text-[13px] uppercase tracking-[0.14em] text-[var(--suave)]">
                        {variante.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t-[3px] border-[var(--regla)] pt-10">
              <p className="jec-label jec-eyebrow mb-4 text-xs font-bold uppercase tracking-[0.28em] md:text-sm">
                Sobre la pieza
              </p>
              <p className="max-w-2xl text-pretty text-base leading-[1.75] text-[var(--suave)] md:text-lg">
                {item.detalle}
              </p>
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-5">
            <div className="rounded-[6px] border border-[var(--linea)] p-7">
              <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--suave)]">
                Ficha
              </p>

              <dl>
                {item.ficha.map((row) => (
                  <div
                    key={row.term}
                    className="mt-3.5 flex items-center justify-between gap-3 border-t border-[var(--linea)] pt-3.5"
                  >
                    <dt className="jec-mono text-[13px] uppercase tracking-[0.14em] text-[var(--suave)]">
                      {row.term}
                    </dt>
                    <dd>
                      {row.placeholder ? (
                        <PlaceholderTag>{row.value}</PlaceholderTag>
                      ) : (
                        <span className="jec-label text-sm">{row.value}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="campo-fuego rounded-[6px] p-7">
              {/* jec-label, no jec-display: la build personal-use de Cayento mapea
                  los diez dígitos al mismo glifo de marca de agua. Sin números en display. */}
              <p className="jec-label text-3xl font-extrabold leading-none tracking-tight">
                JEC 2026
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
          aria-label="Más piezas"
          className="campo-tinta px-6 py-20 md:px-10 md:py-24 lg:px-16"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Seguí mirando" title="Más piezas" className="mb-10" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((relacionado) => (
                <ProductoCard key={relacionado.id} item={relacionado} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </>
  )
}
