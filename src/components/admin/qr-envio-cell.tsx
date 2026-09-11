"use client"

import { useTransition } from "react"

import { AlertTriangle, Check, Send } from "lucide-react"
import { toast } from "sonner"

import { reenviarQr } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type QrEnvioCellProps = {
  inscripcionId: string
  email: string
  emailEnviadoAt: string | null
  emailError: string | null
}

function formatFechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // 24 horas a proposito. Con `hour12`, el ICU de Node y el del navegador usan
    // espacios distintos antes del "p. m." (U+202F vs U+00A0) y React tira un
    // error de hidratacion por dos textos que se ven identicos. Ademas, en una
    // puerta con apuro, "14:32" no se confunde con nada.
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso))
}

export function QrEnvioCell({
  inscripcionId,
  email,
  emailEnviadoAt,
  emailError,
}: QrEnvioCellProps) {
  const [isPending, startTransition] = useTransition()

  function reenviar() {
    startTransition(async () => {
      const resultado = await reenviarQr(inscripcionId)
      if (resultado.ok) toast.success(resultado.message)
      else toast.error(resultado.message)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {emailEnviadoAt ? (
        <Badge variant="secondary" className="gap-1" title={`Enviado a ${email}`}>
          <Check className="size-3" />
          {formatFechaHora(emailEnviadoAt)}
        </Badge>
      ) : emailError ? (
        // El mensaje crudo va en el `title`: es lo que hace accionable el error
        // —una cuota agotada y un rechazo del servidor se arreglan distinto— sin
        // ensuciar la fila con un stack.
        <Badge variant="outline" className="gap-1 border-destructive/50 text-destructive" title={emailError}>
          <AlertTriangle className="size-3" />
          Falló
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground" title="Todavía no se registró un envío">
          Pendiente
        </Badge>
      )}

      {/* Si ya salió pero el último reintento falló, la persona TIENE su QR: se
          marca como aviso y no como pendiente, para no mandarle un duplicado. */}
      {emailEnviadoAt && emailError ? (
        <AlertTriangle
          className="size-3.5 text-amber-600"
          aria-label="El último reenvío falló, pero ya había recibido su QR"
        />
      ) : null}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={reenviar}
        disabled={isPending}
        title={emailEnviadoAt ? "Volver a enviar el QR" : "Enviar el QR"}
      >
        <Send className="size-4" />
        <span className="sr-only">Reenviar QR a {email}</span>
      </Button>
    </div>
  )
}
