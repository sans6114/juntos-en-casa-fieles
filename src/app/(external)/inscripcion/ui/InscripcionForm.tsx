"use client"

import { useActionState, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { crearInscripcion } from "@/actions"
import type { InscripcionActionState } from "@/interfaces/inscripcion"
import { CongregacionCombobox, type Congregacion } from "./CongregacionCombobox"
import { AlertIcon, CtaButton } from "@/components/external/shared"

type InscripcionFormProps = {
  congregaciones: Congregacion[]
}

type SubmittedValues = {
  nombre: string
  email: string
  telefono: string
  edad: string
  congregacionId: string
  congregacionQuery: string
}

const initialState: InscripcionActionState = { ok: false }

const emptySubmitted: SubmittedValues = {
  nombre: "",
  email: "",
  telefono: "",
  edad: "",
  congregacionId: "",
  congregacionQuery: "",
}

const inputClassName =
  "min-h-12 w-full rounded-[6px] border border-[var(--regla)] bg-transparent px-4 py-3 text-base text-[var(--dato)] placeholder:text-[var(--suave)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)] aria-invalid:border-2 aria-invalid:border-[var(--acento)]"

export function InscripcionForm({ congregaciones }: InscripcionFormProps) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState<SubmittedValues>(emptySubmitted)

  const [state, formAction, isPending] = useActionState(submitInscripcion, initialState)

  async function submitInscripcion(
    prevState: InscripcionActionState,
    formData: FormData
  ): Promise<InscripcionActionState> {
    setSubmitted({
      nombre: String(formData.get("nombre") ?? ""),
      email: String(formData.get("email") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      edad: String(formData.get("edad") ?? ""),
      congregacionId: String(formData.get("congregacionId") ?? ""),
      congregacionQuery: String(formData.get("congregacionQuery") ?? ""),
    })
    // Sin estado optimista a propósito: el éxito se anuncia SOLO cuando la action
    // lo confirma. Anunciarlo antes hacía que un email duplicado viera "¡Gracias!"
    // y se lo retiraran un instante después. `isPending` ya cubre la espera.
    return crearInscripcion(prevState, formData)
  }

  useEffect(() => {
    if (state.ok) {
      router.push("/inscripcion/confirmacion")
    }
  }, [state, router])

  if (state.ok) {
    return (
      <div role="status" className="space-y-3 py-6 text-center">
        <p className="jec-label jec-eyebrow text-xs font-bold uppercase tracking-[0.2em]">
          Registro enviado
        </p>
        <p className="jec-display text-2xl sm:text-3xl">
          ¡Gracias, {submitted.nombre || "futuro asistente"}!
        </p>
        <p className="text-[var(--suave)]">
          Estamos confirmando tu inscripción con {submitted.email || "tu email"}…
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.message ? (
        <p
          role="alert"
          className="jec-label rounded-[6px] border-l-[3px] border-[var(--acento)] bg-[color-mix(in_srgb,var(--acento)_10%,transparent)] px-4 py-3 text-sm text-[var(--dato)]"
        >
          {state.message}
        </p>
      ) : null}

      <Field label="Nombre" htmlFor="nombre" error={state.fieldErrors?.nombre}>
        <input
          id="nombre"
          name="nombre"
          type="text"
          defaultValue={submitted.nombre}
          autoComplete="name"
          aria-invalid={Boolean(state.fieldErrors?.nombre)}
          aria-describedby={state.fieldErrors?.nombre ? "nombre-error" : undefined}
          className={inputClassName}
        />
      </Field>

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={submitted.email}
          autoComplete="email"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className={inputClassName}
        />
      </Field>

      <Field label="Teléfono" htmlFor="telefono" error={state.fieldErrors?.telefono}>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          defaultValue={submitted.telefono}
          autoComplete="tel"
          aria-invalid={Boolean(state.fieldErrors?.telefono)}
          aria-describedby={state.fieldErrors?.telefono ? "telefono-error" : undefined}
          className={inputClassName}
        />
      </Field>

      <Field label="Edad" htmlFor="edad" error={state.fieldErrors?.edad}>
        <input
          id="edad"
          name="edad"
          type="number"
          min={12}
          max={99}
          defaultValue={submitted.edad}
          aria-invalid={Boolean(state.fieldErrors?.edad)}
          aria-describedby={state.fieldErrors?.edad ? "edad-error" : undefined}
          className={inputClassName}
        />
      </Field>

      <div className="space-y-2">
        <label
          htmlFor="congregacion-input"
          className="jec-label block text-xs font-bold uppercase tracking-[0.14em] text-[var(--suave)]"
        >
          Congregación{" "}
          <span className="font-normal normal-case tracking-normal">(opcional)</span>
        </label>
        <CongregacionCombobox
          congregaciones={congregaciones}
          defaultQuery={submitted.congregacionQuery}
          defaultCongregacionId={submitted.congregacionId}
        />
      </div>

      <CtaButton as="button" type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando…" : "Confirmar inscripción"}
      </CtaButton>
    </form>
  )
}

type FieldProps = {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="jec-label block text-xs font-bold uppercase tracking-[0.14em] text-[var(--suave)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="flex items-center gap-1.5 text-sm text-[var(--acento)]"
        >
          <AlertIcon size={16} className="shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
