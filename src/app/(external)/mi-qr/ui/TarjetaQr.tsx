"use client"

import { useRef, useState } from "react"

import { QRCodeCanvas, QRCodeSVG } from "qrcode.react"

import { CtaButton } from "@/components/external/shared"

const TAMANO_EN_PANTALLA = 240

/**
 * El PNG sale MUY por encima de lo que se ve en pantalla a propósito: termina en
 * la galería del celular, donde se abre ampliado y a veces se manda reenviado por
 * WhatsApp, que recomprime. Un código chico no sobrevive ese camino.
 */
const TAMANO_DE_DESCARGA = 1024

/**
 * Cuatro módulos de zona tranquila, que es el mínimo que pide el estándar. Sin
 * margen, un QR pegado contra el borde de la imagen no lo lee ningún escáner.
 * `marginSize` reemplaza al `includeMargin` deprecado de qrcode.react v4.
 */
const MARGEN = 4

const NOMBRE_ARCHIVO = "mi-qr-juntos-en-casa.png"

type TarjetaQrProps = {
  /** El `id` de la inscripción: lo mismo que ya está en el QR del mail. */
  valor: string
}

/**
 * El QR de una persona, en grande y descargable.
 *
 * Vive en un solo lugar porque hay DOS pantallas que lo muestran idéntico: el
 * camino feliz de `/mi-qr` (entró su email) y `/mi-qr/<token>` (el link
 * permanente). Tenerlo duplicado hacía que cualquier cambio —este mismo botón—
 * hubiera que hacerlo dos veces y se desviaran.
 *
 * Sigue sin mostrar el nombre. La identidad se verifica del lado del escáner,
 * donde el dato sale de la base; acá sería texto que el visitante controla, no
 * verifica nada y le roba superficie al código.
 */
export function TarjetaQr({ valor }: TarjetaQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    const canvas = canvasRef.current

    if (!canvas) {
      setError("No pudimos preparar la imagen. Sacale una captura de pantalla al código.")
      return
    }

    setGuardando(true)

    try {
      // Blob y no `toDataURL`: el data URL de este QR pesa 124 KB, y cuando el
      // navegador no honra `download` intenta NAVEGAR a esa URL — que Chrome
      // bloquea para `data:` desde la versión 60. Falla en silencio, que es
      // exactamente lo que pasaba en el celular.
      const blob = await new Promise<Blob | null>((resolver) =>
        canvas.toBlob(resolver, "image/png")
      )
      if (!blob) throw new Error("El canvas no devolvió imagen")

      const archivo = new File([blob], NOMBRE_ARCHIVO, { type: "image/png" })

      // En el celular la hoja nativa es el ÚNICO camino a la galería de fotos:
      // un `<a download>` en iOS guarda en Archivos, no en Fotos, y el QR
      // termina donde nadie lo busca cuando está haciendo la fila.
      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo] })
          setError(null)
          return
        } catch (error) {
          // Cerrar la hoja sin elegir nada NO es un fallo y no se avisa.
          if (error instanceof DOMException && error.name === "AbortError") return
          // Cualquier otra cosa sigue al camino de descarga de abajo.
        }
      }

      const url = URL.createObjectURL(blob)
      const enlace = document.createElement("a")
      enlace.href = url
      enlace.download = NOMBRE_ARCHIVO
      document.body.append(enlace)
      enlace.click()

      // El anchor NO se saca en el mismo tick que el click: varios navegadores
      // móviles arrancan la descarga de forma asíncrona y quitarlo antes la
      // cancela sin decir nada.
      setTimeout(() => {
        enlace.remove()
        URL.revokeObjectURL(url)
      }, 1000)

      setError(null)
    } catch {
      // La captura de pantalla SIEMPRE funciona, en cualquier teléfono y sin
      // permisos. Es el consejo correcto acá, no un "reintentá" que va a fallar
      // de nuevo por la misma razón.
      setError("No pudimos guardar la imagen. Sacale una captura de pantalla al código.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm text-center">
      {/* Fondo blanco deliberado: el QR necesita el contraste máximo para escanear. */}
      <div className="flex flex-col items-center justify-center rounded-[6px] border border-[var(--regla)] bg-white p-6 shadow-[3px_3px_0_0_var(--regla)]">
        <QRCodeSVG
          value={valor}
          size={TAMANO_EN_PANTALLA}
          level="H"
          marginSize={MARGEN}
        />
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-[var(--suave)]">
        Subí el brillo de la pantalla para que se escanee más rápido.
      </p>

      <CtaButton
        as="button"
        variant="pill"
        onClick={guardar}
        disabled={guardando}
        className="mt-5"
      >
        {guardando ? "Preparando…" : "Guardar mi QR"}
      </CtaButton>

      <p className="mt-3 text-[13px] leading-relaxed text-[var(--suave)]">
        Guardalo en el celular por si el día del evento no tenés señal.
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-[13px] leading-relaxed text-[var(--acento-texto)]">
          {error}
        </p>
      ) : null}

      {/*
        El mismo código, dibujado en un canvas fuera de pantalla: es de donde
        sale el PNG. Se mantiene aparte del SVG visible porque cada uno hace lo
        suyo mejor — el SVG se ve nítido a cualquier tamaño, y el canvas es lo
        único que da un `toBlob`. Serializar el SVG a mano sería más código y
        más formas de romperse.
        El canvas dibuja igual con `display: none`: no depende del layout.
      */}
      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas
          ref={canvasRef}
          value={valor}
          size={TAMANO_DE_DESCARGA}
          level="H"
          marginSize={MARGEN}
          bgColor="#FFFFFF"
        />
      </div>
    </div>
  )
}
