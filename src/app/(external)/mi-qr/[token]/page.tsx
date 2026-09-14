import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteHeader } from "@/components/external/shared"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo/site"

import { TarjetaQr } from "../ui/TarjetaQr"

export const metadata: Metadata = createPageMetadata({
  title: "Tu QR",
  path: "/mi-qr",
  noIndex: true,
})

// El contenido depende de un token: nunca se cachea ni se prerenderiza.
export const dynamic = "force-dynamic"

type MiQrTokenPageProps = {
  params: Promise<{ token: string }>
}

/**
 * El QR de una persona, accesible por su link permanente. Es el enlace que va en
 * el mail de inscripción y el que se puede mandar por WhatsApp: un toque y el
 * código aparece, sin tener que recordar con qué email se anotó.
 *
 * Sin sesión: los 122 bits del token SON la credencial. Por eso el token es una
 * columna aparte y no el `id`, que es un cuid y no sirve de secreto.
 */
export default async function MiQrTokenPage({ params }: MiQrTokenPageProps) {
  const { token } = await params

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { qrToken: token },
    select: { id: true },
  })

  // Un token con typo tiene que ser 404, no un error. Por eso la columna es TEXT
  // y no uuid nativo: con uuid, Prisma tiraría por sintaxis inválida y esto
  // sería un 500.
  if (!inscripcion) notFound()

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <section className="campo-papel px-6 pb-24 pt-6 md:px-10 md:pb-28">
          {/* Mismo componente que el camino feliz de /mi-qr: las dos pantallas
              muestran exactamente lo mismo, así que el QR vive en un solo
              lugar. */}
          <TarjetaQr valor={inscripcion.id} />
        </section>
      </main>
    </>
  )
}
