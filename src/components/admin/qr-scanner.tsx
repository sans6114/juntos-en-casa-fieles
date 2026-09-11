"use client"

import { useEffect, useState } from "react"

import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner"
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"

import { processQrScan } from "@/actions/admin/qr-attendance"
import { Badge } from "@/components/ui/badge"
import type { EscaneoResultado } from "@/interfaces/asistencia"

export function QrScanner() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [resultado, setResultado] = useState<EscaneoResultado | null>(null)

  // Timeout para evitar escanear el mismo QR múltiples veces en ráfaga
  useEffect(() => {
    if (lastScanned) {
      const timer = setTimeout(() => setLastScanned(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastScanned])

  const handleScan = async (codigos: IDetectedBarcode[]) => {
    const qrValue = codigos[0]?.rawValue
    if (!qrValue) return

    if (isProcessing || lastScanned === qrValue) return

    setIsProcessing(true)
    setLastScanned(qrValue)

    try {
      setResultado(await processQrScan(qrValue))
    } catch (error) {
      console.error("Error procesando el QR:", error)
      setResultado({ ok: false, message: "Ocurrió un error al procesar el QR" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow">
        <div className="relative aspect-[4/3] bg-black">
          <Scanner
            onScan={handleScan}
            formats={["qr_code"]}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { objectFit: "cover" },
            }}
          />

          {isProcessing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-white">
                <Loader2 className="size-8 animate-spin" />
                <p className="text-sm font-medium">Procesando...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <PanelResultado resultado={resultado} />

      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <h3 className="mb-2 font-medium text-foreground">Instrucciones:</h3>
        <ul className="ml-4 list-disc space-y-1">
          <li>Apuntá la cámara al código QR, esté en papel o en la pantalla del celular.</li>
          <li>Comprobá que el nombre que aparece sea el de la persona que tenés enfrente.</li>
          <li>El resultado queda en pantalla hasta el siguiente escaneo.</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * El resultado vive en un panel y no en un toast: un toast es chico y se va
 * solo, y acá el dato principal —el nombre— es lo que le permite al colaborador
 * verificar que el QR corresponde a quien se lo presenta. Tiene que poder
 * mirarlo el tiempo que necesite, hasta el escaneo siguiente.
 */
function PanelResultado({ resultado }: { resultado: EscaneoResultado | null }) {
  if (!resultado) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
        Escaneá un código para ver de quién se trata.
      </div>
    )
  }

  const { ok, yaAcreditado, persona, message } = resultado

  const tono = ok
    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
    : yaAcreditado
      ? "border-amber-300 bg-amber-50 text-amber-950"
      : "border-destructive/40 bg-destructive/10"

  const Icono = ok ? CheckCircle2 : yaAcreditado ? Clock : AlertCircle

  return (
    <div role="status" aria-live="polite" className={`rounded-xl border p-5 ${tono}`}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Icono className="size-4 shrink-0" />
        {message}
      </p>

      {persona ? (
        <>
          {/* En grande y primero: es el dato que se verifica contra la persona. */}
          <p className="mt-3 text-3xl leading-tight font-bold break-words">{persona.nombre}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-base">{persona.congregacion.texto}</span>
            {persona.congregacion.pendiente ? (
              <Badge variant="outline" title="Escrita a mano al inscribirse. Avisale al administrador para que la apruebe o la rechace.">
                Congregación sin aprobar
              </Badge>
            ) : null}
          </div>

          {ok ? (
            <p className="mt-3 text-sm opacity-80">Acreditado a las {persona.horaLlegada} hs</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
