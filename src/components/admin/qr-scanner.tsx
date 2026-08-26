"use client"

import React, { useState, useEffect } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { processQrScan } from "@/actions/admin/qr-attendance"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function QrScanner() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  
  // Timeout para evitar escanear el mismo QR múltiples veces en ráfaga
  useEffect(() => {
    if (lastScanned) {
      const timer = setTimeout(() => setLastScanned(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastScanned])

  const handleScan = async (result: any) => {
    if (!result || result.length === 0) return
    
    // Obtener el valor del QR
    const qrValue = result[0].rawValue

    if (isProcessing || lastScanned === qrValue) return

    setIsProcessing(true)
    setLastScanned(qrValue)

    try {
      const res = await processQrScan(qrValue)
      
      if (res.ok) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Ocurrió un error al procesar el QR")
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
            formats={['qr_code']}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { objectFit: 'cover' }
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
      
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <h3 className="mb-2 font-medium text-foreground">Instrucciones:</h3>
        <ul className="ml-4 list-disc space-y-1">
          <li>Apunta la cámara al código QR de la inscripción.</li>
          <li>El escaneo se procesará automáticamente.</li>
          <li>Recibirás una notificación con el resultado en la pantalla.</li>
        </ul>
      </div>
    </div>
  )
}
