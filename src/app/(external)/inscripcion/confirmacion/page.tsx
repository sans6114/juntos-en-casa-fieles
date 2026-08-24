import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createPageMetadata } from "@/lib/seo/site"
import { QRCodeSVG } from "qrcode.react"
import { CtaButton, SiteHeader } from "@/components/external/shared"

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

  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

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

          <CtaButton href="/" className="mt-8">
            Volver al inicio
          </CtaButton>
        </div>
      </section>
    </>
  )
}
