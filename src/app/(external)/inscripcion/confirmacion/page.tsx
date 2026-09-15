import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createPageMetadata } from "@/lib/seo/site"
import { QRCodeSVG } from "qrcode.react"
import { CtaButton, SiteHeader } from "@/components/external/shared"
import { urlDelQr } from "@/lib/inscripcion/enviar-qr"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = createPageMetadata({
  title: "Inscripción confirmada",
  path: "/inscripcion/confirmacion",
  noIndex: true,
})

export default async function InscripcionConfirmacionPage() {
  const cookieStore = await cookies()
  const inscripcionOk = cookieStore.get("jec_inscripcion_ok")?.value === "1"
  const inscripcionUuid = cookieStore.get("jec_inscripcion_uuid")?.value

  if (!inscripcionOk || !inscripcionUuid) {
    redirect("/inscripcion")
  }

  // El token se busca por el id que ya está en la cookie, en vez de guardarlo en
  // una cookie propia: así esta página sigue funcionando para quien la abrió
  // durante un deploy, sin que el gate de arriba dependa de un dato nuevo.
  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionUuid },
    select: { qrToken: true },
  })
  const qrUrl = inscripcion ? urlDelQr(inscripcion.qrToken) : null

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <section className="campo-papel px-6 pb-24 pt-10 text-center md:px-10 md:pb-28">
          <div className="mx-auto max-w-lg">
            <p className="jec-label jec-eyebrow inline-block text-xs font-bold uppercase tracking-[0.28em]">
              Inscripción recibida
            </p>
            <h1 className="jec-display mt-4 text-4xl leading-[0.95] sm:text-5xl">¡Ya estás dentro!</h1>

            {/* Fondo blanco deliberado: el QR necesita el contraste máximo para escanear. */}
            <div className="mx-auto my-10 flex max-w-sm flex-col items-center justify-center rounded-[6px] border border-[var(--regla)] bg-white p-6 shadow-[3px_3px_0_0_var(--regla)]">
              <QRCodeSVG value={inscripcionUuid} size={220} level="H" includeMargin />
            </div>

            <p className="text-pretty leading-relaxed text-[var(--suave)]">
              Te enviamos un email con tu código QR de inscripción. Podés sacarle captura a esta
              pantalla y guardarlo, lo vas a necesitar el día del evento.
            </p>

            {/* Esta pantalla vive 10 minutos: depende de una cookie que vence.
                El link de abajo no vence nunca, y es la diferencia entre perder
                el QR al cerrar la pestaña y tenerlo siempre a mano. */}
            {qrUrl ? (
              <div className="mt-8 rounded-[6px] border border-[var(--linea)] px-5 py-4 text-left">
                <p className="jec-label text-xs font-bold uppercase tracking-[0.14em] text-[var(--suave)]">
                  Tu enlace permanente
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--suave)]">
                  Guardalo: abre tu QR cuando quieras, sin depender de esta pantalla ni del mail.
                </p>
                <a
                  href={qrUrl}
                  className="jec-anchor mt-3 inline-block break-all text-[15px] text-[var(--dato)] underline"
                >
                  {qrUrl}
                </a>
              </div>
            ) : null}

            <CtaButton href="/" className="mt-8">
              Volver al inicio
            </CtaButton>
          </div>
        </section>
      </main>
    </>
  )
}
