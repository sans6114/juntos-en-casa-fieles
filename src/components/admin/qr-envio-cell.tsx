"use client"

import { useTransition } from "react"

import { AlertTriangle, Check, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"

import { marcarRecordatorio, reenviarQr } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/utils/whatsapp"

type QrEnvioCellProps = {
  inscripcionId: string
  nombre: string
  /** `null` en las altas de puerta: no hay a dónde mandar el QR. */
  email: string | null
  telefono: string | null
  /** URL permanente del QR, armada en el servidor. */
  qrUrl: string
  emailEnviadoAt: string | null
  emailError: string | null
  /** Cuándo se le mandó el recordatorio previo al evento. */
  recordatorioEnviadoAt: string | null
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
  nombre,
  email,
  telefono,
  qrUrl,
  emailEnviadoAt,
  emailError,
  recordatorioEnviadoAt,
}: QrEnvioCellProps) {
  const [isPending, startTransition] = useTransition()

  // `wa.me` solo admite TEXTO: no se puede adjuntar el QR como imagen. Por eso
  // el mensaje lleva el link permanente, que abre el código de un toque.
  const urlWhatsApp = buildWhatsAppUrl(
    telefono,
    `Hola ${nombre}, te dejamos tu QR para Juntos en Casa. Mostralo en la puerta: ${qrUrl}`
  )

  function reenviar() {
    startTransition(async () => {
      const resultado = await reenviarQr(inscripcionId)
      if (resultado.ok) toast.success(resultado.message)
      else toast.error(resultado.message)
    })
  }

  function alternarRecordatorio(marcado: boolean) {
    startTransition(async () => {
      const resultado = await marcarRecordatorio(inscripcionId, marcado)
      if (resultado.ok) toast.success(resultado.message)
      else toast.error(resultado.message)
    })
  }

  // El marcador de recordatorio va al lado del botón de WhatsApp porque se usan
  // juntos: se manda y se tilda. Es lo único que permite que varios
  // colaboradores trabajen la MISMA lista en paralelo sin repartírsela — quien
  // queda tildado desaparece del filtro para todos.
  const marcadorRecordatorio = (
    <label
      className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"
      title={
        recordatorioEnviadoAt
          ? `Recordatorio marcado el ${formatFechaHora(recordatorioEnviadoAt)}`
          : "Marcar cuando le hayas mandado el recordatorio"
      }
    >
      <Checkbox
        checked={Boolean(recordatorioEnviadoAt)}
        onCheckedChange={(marcado) => alternarRecordatorio(marcado === true)}
        disabled={isPending}
        aria-label={`Recordatorio enviado a ${nombre}`}
      />
      {recordatorioEnviadoAt ? "Recordado" : "Recordar"}
    </label>
  )

  // El botón de WhatsApp vale para todos y se arma aparte del bloque de mail:
  // justamente a quien se anotó en la puerta SIN mail, WhatsApp le queda como
  // único canal para hacerle llegar su QR.
  const botonWhatsApp = urlWhatsApp ? (
    <a
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      title={`Mandarle el QR a ${nombre} por WhatsApp`}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "text-[#128C7E] hover:text-[#0e7368]"
      )}
    >
      <MessageCircle className="size-4" />
      <span className="sr-only">Mandar el QR a {nombre} por WhatsApp</span>
    </a>
  ) : null

  // Alta de puerta sin mail: no está pendiente de nada y no debe ofrecer un
  // reenvío que siempre fallaría. Se muestra el estado y, si hay teléfono
  // utilizable, el camino que sí sirve.
  if (!email) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground" title="Se inscribió en la puerta, sin email">
          Sin email
        </span>
        {botonWhatsApp}
        {marcadorRecordatorio}
      </div>
    )
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

      {botonWhatsApp}
      {marcadorRecordatorio}
    </div>
  )
}
