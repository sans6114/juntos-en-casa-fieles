import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createPageMetadata } from "@/lib/seo/site"
import { QRCodeSVG } from "qrcode.react"

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
    <section className="relative overflow-x-clip px-4 py-24 text-center">
      <div className="mx-auto max-w-lg space-y-6">
        <p className="jec-label text-xs font-bold uppercase tracking-[0.2em] text-[var(--jec-amber)]">
          Inscripción recibida
        </p>
        <h1 className="jec-display text-4xl sm:text-5xl">¡Ya estás dentro!</h1>

        <div className="mx-auto mt-8 mb-8 flex max-w-sm flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-xl">
          <QRCodeSVG 
            value={inscripcionUuid} 
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-[var(--jec-smoke)]">
          Te enviamos un email con tu código QR de inscripción. Podés sacarle captura a esta pantalla y guardarlo, lo vas a
          necesitar el día del evento.
        </p>
        <Link
          href="/"
          className="jec-label inline-flex items-center justify-center bg-[var(--jec-ember)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--jec-bone)] transition-colors hover:bg-[var(--jec-amber)] hover:text-[var(--jec-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)] md:px-10 md:py-4 md:text-base"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
