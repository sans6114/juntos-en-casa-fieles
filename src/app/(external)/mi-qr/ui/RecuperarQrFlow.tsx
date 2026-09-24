"use client"

import { useRef, useState, useTransition } from "react"

import { recuperarQr } from "@/actions"
import { ACCION_POST_EVENTO, AlertIcon, CtaButton } from "@/components/external/shared"
import { RecuperarQrSchema } from "@/interfaces/inscripcion"

import { TarjetaQr } from "./TarjetaQr"
import { InscripcionCard } from "../../inscripcion/ui/InscripcionCard"

/**
 * Sin props: `congregaciones` existía solo para alimentar el formulario de
 * inscripción que se mostraba cuando el email no aparecía. Ese camino se cerró
 * al terminar el evento, así que la consulta que lo alimentaba tampoco hace
 * falta — ver la nota en el estado `no-encontrado`.
 */

/**
 * Los cinco estados de la pantalla. Se modelan explícitos porque cada uno pide
 * algo distinto de la persona, y el que siempre se olvida —`error`— es el que
 * la deja mirando un spinner para siempre si no existe.
 */
type Estado =
  | { tipo: "idle" }
  | { tipo: "encontrado"; qrValue: string }
  | { tipo: "no-encontrado"; email: string }
  | { tipo: "error"; message: string; reintentable: boolean }

const inputClassName =
  "min-h-12 w-full rounded-[6px] border border-[var(--regla)] bg-transparent px-4 py-3 text-base text-[var(--dato)] placeholder:text-[var(--suave)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)] aria-invalid:border-2 aria-invalid:border-[var(--acento-texto)]"

export function RecuperarQrFlow() {
  const [email, setEmail] = useState("")
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" })
  const [isPending, startTransition] = useTransition()
  const alertRef = useRef<HTMLParagraphElement>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Normalización en el cliente (la primera de tres: acá, en el schema de la
    // action y en la consulta con `mode: "insensitive"`). Es para que el feedback
    // sea coherente; la fuente de verdad nunca es el cliente.
    const limpio = email.trim().toLowerCase()

    // Se valida el formato ANTES de salir a la red: un email mal escrito no
    // merece un viaje al servidor ni la espera que eso implica en el 4G de un
    // salón lleno.
    const local = RecuperarQrSchema.safeParse({ email: limpio })
    if (!local.success) {
      setEstado({
        tipo: "error",
        message: local.error.issues[0]?.message ?? "Revisá el email ingresado.",
        reintentable: false,
      })
      return
    }

    startTransition(async () => {
      const resultado = await recuperarQr(limpio)

      switch (resultado.estado) {
        case "encontrado":
          setEstado({ tipo: "encontrado", qrValue: resultado.qrValue })
          break
        case "no-encontrado":
          setEstado({ tipo: "no-encontrado", email: resultado.email })
          break
        // Límite de intentos y fallo real se separan a propósito: uno pide
        // esperar y el otro pide reintentar. Con el mismo texto, la gente
        // reintenta justo cuando no debe.
        case "limitado":
          setEstado({ tipo: "error", message: resultado.message, reintentable: false })
          break
        case "invalido":
          setEstado({ tipo: "error", message: resultado.message, reintentable: false })
          break
        case "error":
          setEstado({ tipo: "error", message: resultado.message, reintentable: true })
          break
      }
    })
  }

  // Camino feliz: SOLO el QR. Sin nombre y sin adornos. El nombre se muestra del
  // otro lado —en el escáner del colaborador, donde sale de la base y sirve para
  // verificar—; acá sería texto que el visitante controla, que no verifica nada
  // y le roba superficie al código.
  if (estado.tipo === "encontrado") {
    return <TarjetaQr valor={estado.qrValue} />
  }

  // Antes acá se mostraba el formulario de inscripción completo: "Completá tus
  // datos y te anotamos ahora". Tenía todo el sentido mientras faltaban días
  // para el evento —quien llegaba buscando su QR sin estar anotado se anotaba
  // en el acto, sin rebotar—.
  //
  // Terminado el evento ese camino pasó a ser un problema: el link a
  // `/mi-qr/<token>` viajó en 546 WhatsApps y mails, así que seguía siendo una
  // puerta abierta para inscribirse a algo que ya pasó. Esa fila entraba en el
  // total de inscriptos y aparecía como "no asistió" en el panel, ensuciando
  // justo los números que se usan para el seguimiento.
  //
  // Para reabrir: volver a montar `InscripcionForm` con `emailInicial` y
  // `redirectTo="/inscripcion/confirmacion"`, que es lo que había acá.
  if (estado.tipo === "no-encontrado") {
    return (
      <InscripcionCard
        titulo="No encontramos esa inscripción"
        subtitulo={`No hay ninguna inscripción registrada con ${estado.email}.`}
      >
        <div className="flex flex-col gap-5">
          <p className="text-pretty text-base leading-relaxed text-[var(--dato)]">
            Fieles 2026 fue el 18, 19 y 20 de septiembre, así que ya no se puede
            anotar nadie. Si creés que te inscribiste con otra dirección, probá
            de nuevo con esa.
          </p>

          <CtaButton href={ACCION_POST_EVENTO.href} className="self-start">
            {ACCION_POST_EVENTO.label}
          </CtaButton>
        </div>
      </InscripcionCard>
    )
  }

  return (
    <InscripcionCard
      titulo="Buscá tu QR"
      subtitulo="Escribí el email con el que te inscribiste y te mostramos tu código."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {estado.tipo === "error" ? (
          <p
            ref={alertRef}
            role="alert"
            tabIndex={-1}
            className="jec-label flex items-start gap-2 rounded-[6px] border-l-[3px] border-[var(--acento-texto)] bg-[color-mix(in_srgb,var(--acento)_10%,transparent)] px-4 py-3 text-sm text-[var(--dato)]"
          >
            <AlertIcon size={16} className="mt-0.5 shrink-0" />
            <span>{estado.message}</span>
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="email-recuperar"
            className="jec-label block text-xs font-bold uppercase tracking-[0.14em] text-[var(--suave)]"
          >
            Email
          </label>
          <input
            id="email-recuperar"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            /* El valor tipeado se conserva incluso cuando falla: quien está en la
               fila no tiene por qué volver a escribirlo. */
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            aria-invalid={estado.tipo === "error"}
            className={inputClassName}
          />
        </div>

        <CtaButton as="button" type="submit" disabled={isPending} className="w-full">
          {isPending ? "Buscando…" : estado.tipo === "error" ? "Probar de nuevo" : "Ver mi QR"}
        </CtaButton>

        {/* El estado de carga es obligatorio, no decorativo: el primer pedido
            puede tardar varios segundos (arranque en frío de la función y de la
            base), y sin señal visible la persona toca el botón cinco veces. */}
        {isPending ? (
          <p className="flex items-center justify-center gap-3 text-sm text-[var(--suave)]">
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-[var(--regla)] border-t-transparent"
            />
            Buscando tu inscripción…
          </p>
        ) : null}
      </form>
    </InscripcionCard>
  )
}
