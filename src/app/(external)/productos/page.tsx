import type { Metadata } from "next"

import { obtenerProductosPublicos } from "@/actions"
import { DondeConseguir, ProductosGrid, ProductosIntro } from "@/components/external/productos"
import { SiteFooter, SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

export const metadata: Metadata = createPageMetadata({
  path: "/productos",
  title: "Productos",
})

export default async function ProductosPage() {
  const items = await obtenerProductosPublicos()

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />
      <ProductosIntro />
      <ProductosGrid items={items} />
      <DondeConseguir />
      <SiteFooter />
    </>
  )
}
