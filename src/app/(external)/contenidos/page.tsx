import type { Metadata } from "next"

import { ContenidosGrid } from "@/components/external/contenidos"
import { SiteHeader } from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

export const metadata: Metadata = createPageMetadata({
  path: "/contenidos",
  title: "Contenidos",
})

export default function ContenidosPage() {
  return (
    <>
      <SiteHeader className="bg-[var(--jec-ink)] pb-2" />
      <ContenidosGrid />
    </>
  )
}
