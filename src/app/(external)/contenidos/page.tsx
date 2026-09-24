import { Suspense } from "react"
import type { Metadata } from "next"

import { obtenerContenidosPublicos } from "@/actions"
import {
  ContenidosCatalogo,
  ContenidosGrid,
  ContenidosIntro,
} from "@/components/external/contenidos"
import { Galeria } from "@/components/external/galeria"
import { SiteFooter, SiteHeader } from "@/components/external/shared"
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

        {/* Acá vivía el bloque "¿Te lo perdiste?" con el CTA de inscripción.
          * Se fue entero el 24/09 y no solo el botón: existía para convertir a
          * inscripción, y anunciaba "2026 ya tiene fecha: 18, 19 y 20 de
          * septiembre" en futuro. Sin inscripción que ofrecer quedaba un titular
          * sin acción, apuntando a un evento que ya pasó — y el CTA post-evento
          * habría linkeado esta misma página contra sí misma. */}
      </main>

      <SiteFooter />
    </>
  )
}
