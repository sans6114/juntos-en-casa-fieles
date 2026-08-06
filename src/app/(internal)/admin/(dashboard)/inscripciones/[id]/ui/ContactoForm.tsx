"use client"

import { useOptimistic, useState, useTransition } from "react"
import { MessageCircle, Save } from "lucide-react"
import { toast } from "sonner"
import { registrarContacto } from "@/actions"
import { buildWhatsAppUrl } from "@/utils/whatsapp"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ContactoState = {
  contactado: boolean
  observacion: string
}

type ContactoFormProps = {
  inscripcionId: string
  telefono: string | null
  nombre: string
  initialContactado: boolean
  initialObservacion: string
  colaboradorActual?: string | null
}

export function ContactoForm({
  inscripcionId,
  telefono,
  nombre,
  initialContactado,
  initialObservacion,
  colaboradorActual,
}: ContactoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [observacion, setObservacion] = useState(initialObservacion)
  const [optimistic, setOptimistic] = useOptimistic(
    { contactado: initialContactado, observacion: initialObservacion } satisfies ContactoState,
    (_current, next: ContactoState) => next
  )

  const waUrl = buildWhatsAppUrl(
    telefono,
    `Hola ${nombre}, te escribimos desde Juntos en Casa.`
  )

  const persist = (next: ContactoState) => {
    startTransition(async () => {
      setOptimistic(next)
      const result = await registrarContacto({
        inscripcionId,
        contactado: next.contactado,
        observacion: next.observacion || null,
      })
      if (!result.ok) {
        toast.error(result.message ?? "No se pudo guardar")
      } else {
        toast.success("Contacto actualizado")
      }
    })
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 sm:p-6">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Tu tarea en 3 pasos
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Contactar a {nombre}
        </h2>
        <p className="text-base leading-relaxed text-stone-600">
          Esta persona se inscribió sin iglesia. Escribile, marcá que la
          contactaste y dejá una nota corta para el admin.
        </p>
        {colaboradorActual ? (
          <p className="text-base text-stone-700">
            Último registro: <strong>{colaboradorActual}</strong>
          </p>
        ) : null}
      </header>

      <ol className="space-y-6">
        <li className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
              1
            </span>
            <p className="text-lg font-semibold text-stone-900">Abrí WhatsApp</p>
          </div>
          <div className="pl-11">
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-2 bg-[#128C7E] px-5 text-base text-white hover:bg-[#0e7368]"
                )}
              >
                <MessageCircle className="size-5" />
                Escribir a {nombre}
              </a>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-3">
                <p className="text-base font-medium text-stone-800">
                  No hay teléfono cargado
                </p>
                <p className="mt-1 text-base text-stone-600">
                  Podés contactar por email ({nombre}) o pedir el número al admin.
                </p>
              </div>
            )}
          </div>
        </li>

        <li className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
              2
            </span>
            <p className="text-lg font-semibold text-stone-900">
              Marcá si ya la contactaste
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-4 pl-11">
            <Checkbox
              id="contactado"
              checked={optimistic.contactado}
              disabled={isPending}
              className="size-5"
              onCheckedChange={(checked) => {
                persist({
                  contactado: checked,
                  observacion,
                })
              }}
            />
            <Label
              htmlFor="contactado"
              className="cursor-pointer text-lg font-medium text-stone-900"
            >
              Ya contacté a esta persona
            </Label>
          </div>
        </li>

        <li className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
              3
            </span>
            <p className="text-lg font-semibold text-stone-900">Dejá una observación</p>
          </div>
          <div className="space-y-3 pl-11">
            <Textarea
              id="observacion"
              placeholder="Ej: Respondió, quiere saber horarios de la sede Norte…"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              disabled={isPending}
              rows={4}
              className="min-h-28 bg-white text-base leading-relaxed"
            />
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11 gap-2 text-base"
              disabled={isPending}
              onClick={() =>
                persist({
                  contactado: optimistic.contactado,
                  observacion,
                })
              }
            >
              <Save className="size-4" />
              Guardar observación
            </Button>
          </div>
        </li>
      </ol>
    </section>
  )
}
