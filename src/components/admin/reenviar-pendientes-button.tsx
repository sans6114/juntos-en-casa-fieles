"use client"

import { useState, useTransition } from "react"

import { Send } from "lucide-react"
import { toast } from "sonner"

import { reenviarQrPendientes } from "@/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * Reenvío en tanda a quienes nunca recibieron su QR.
 *
 * Pide confirmación y dice cuántos mails va a mandar porque es una acción que
 * sale del sistema: una vez enviados no se vuelven atrás, y la cuenta de Gmail
 * tiene un tope diario que conviene no quemar sin querer.
 */
export function ReenviarPendientesButton({ pendientes }: { pendientes: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (pendientes === 0) return null

  function enviar() {
    startTransition(async () => {
      const resultado = await reenviarQrPendientes()
      if (resultado.ok && resultado.fallidos === 0) toast.success(resultado.message)
      else toast.error(resultado.message)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <Send className="size-4" />
            Reenviar pendientes
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reenviar QR pendientes</DialogTitle>
          <DialogDescription>
            Hay {pendientes} {pendientes === 1 ? "persona" : "personas"} sin registro de envío
            exitoso. Se manda de a 25 por tanda para no saturar la casilla; si quedan más, volvé a
            tocar el botón.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Ojo: que no haya registro de envío no prueba que el mail no haya salido. Si alguien ya lo
          recibió, va a recibirlo dos veces.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={enviar} disabled={isPending}>
            {isPending ? "Enviando…" : `Enviar ${Math.min(pendientes, 25)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
