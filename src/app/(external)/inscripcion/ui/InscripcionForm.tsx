"use client"

import { useActionState, useEffect, useOptimistic, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { crearInscripcion } from "@/actions"
import type { InscripcionActionState } from "@/interfaces/inscripcion"
import { CongregacionCombobox, type Congregacion } from "./CongregacionCombobox"

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
  "w-full border border-[var(--jec-smoke)] bg-[var(--jec-ink)] px-4 py-3 text-[var(--jec-bone)] placeholder:text-[var(--jec-smoke)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jec-amber)] aria-invalid:border-[var(--jec-ember)]"

export function InscripcionForm({ congregaciones }: InscripcionFormProps) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState<SubmittedValues>(emptySubmitted)

  const [state, formAction, isPending] = useActionState(submitInscripcion, initialState)
  const [optimisticState, setOptimisticState] = useOptimistic(
    state,
    (_prev: InscripcionActionState, next: InscripcionActionState) => next
  )

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
    setOptimisticState({ ok: true })
    return crearInscripcion(prevState, formData)
  }

  useEffect(() => {
    if (state.ok) {
      router.push("/inscripcion/confirmacion")
    }
  }, [state, router])

  if (optimisticState.ok) {
    return (
      <div role="status" className="space-y-3 py-6 text-center">
        <p className="jec-label text-xs font-bold uppercase tracking-[0.2em] text-[var(--jec-amber)]">
          Registro enviado
        </p>
        <p className="jec-display text-2xl sm:text-3xl">
          ¡Gracias, {submitted.nombre || "futuro asistente"}!
        </p>
        <p className="text-[var(--jec-smoke)]">
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
          className="jec-label border-l-4 border-[var(--jec-ember)] bg-[var(--jec-ink)] px-4 py-3 text-sm text-[var(--jec-bone)]"
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
          className="jec-label block text-xs font-bold uppercase tracking-[0.14em] text-[var(--jec-smoke)]"
        >
          Congregación{" "}
          <span className="normal-case font-normal text-[var(--jec-smoke)]">(opcional)</span>
        </label>
        <CongregacionCombobox
          congregaciones={congregaciones}
          defaultQuery={submitted.congregacionQuery}
          defaultCongregacionId={submitted.congregacionId}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="jec-label inline-flex w-full items-center justify-center bg-[var(--jec-ember)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--jec-bone)] transition-colors hover:bg-[var(--jec-amber)] hover:text-[var(--jec-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)] disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
      >
        {isPending ? "Enviando…" : "Confirmar inscripción"}
      </button>
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
        className="jec-label block text-xs font-bold uppercase tracking-[0.14em] text-[var(--jec-smoke)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-[var(--jec-ember)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
