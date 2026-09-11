import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { QRCodeSVG } from "qrcode.react"

import { SiteHeader } from "@/components/external/shared"
import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo/site"

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
          {/* Solo el QR, igual que el camino feliz de /mi-qr: la identidad se
              verifica del lado del escáner, y acá cualquier texto de más le
              roba superficie al código. */}
          <div className="mx-auto max-w-sm text-center">
            <div className="flex flex-col items-center justify-center rounded-[6px] border border-[var(--regla)] bg-white p-6 shadow-[3px_3px_0_0_var(--regla)]">
              <QRCodeSVG value={inscripcion.id} size={240} level="H" includeMargin />
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-[var(--suave)]">
              Subí el brillo de la pantalla para que se escanee más rápido.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
