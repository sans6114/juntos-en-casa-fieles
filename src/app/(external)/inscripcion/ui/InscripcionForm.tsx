"use client"

import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { crearInscripcion } from '@/actions';
import {
  AlertIcon,
  CtaButton,
} from '@/components/external/shared';
import type { InscripcionActionState } from '@/interfaces/inscripcion';
import { esVidaSobrenatural } from '@/lib/congregacion/vida-sobrenatural';

import {
  type Congregacion,
  CongregacionCombobox,
} from './CongregacionCombobox';

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
  tipoCongregacion: string
}

const initialState: InscripcionActionState = { ok: false }

const emptySubmitted: SubmittedValues = {
  nombre: "",
  email: "",
  telefono: "",
  edad: "",
  congregacionId: "",
  congregacionQuery: "",
  tipoCongregacion: "",
}

const inputClassName =
  "min-h-12 w-full rounded-[6px] border border-[var(--regla)] bg-transparent px-4 py-3 text-base text-[var(--dato)] placeholder:text-[var(--suave)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)] aria-invalid:border-2 aria-invalid:border-[var(--acento-texto)]"

export function InscripcionForm({ congregaciones }: InscripcionFormProps) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState<SubmittedValues>(emptySubmitted)

  // La congregacion propia del evento se saca del listado de "otra" para no
  // ofrecerla dos veces. La FK NO se resuelve aca: la resuelve `crearInscripcion`
  // en el servidor, asi el checkbox funciona aunque la fila este PENDIENTE,
  // renombrada, o todavia no exista.
  const otrasCongregaciones = congregaciones.filter((c) => !esVidaSobrenatural(c.nombre))

  type SelectionType = "vsn" | "nuevo" | "otra" | null
  const [selection, setSelection] = useState<SelectionType>(null)
  const [comboQuery, setComboQuery] = useState(submitted.congregacionQuery)
  const [comboId, setComboId] = useState(submitted.congregacionId)

  // Restaura la eleccion tras un envio rechazado por el servidor. Lee el valor
  // que se envio en vez de deducirlo de los campos: la version anterior asumia
  // "nuevo" cuando id y query venian vacios, asi que a quien no marcaba nada le
  // dejaba "Soy nuevo" pre-marcado y podia terminar declarando algo que no eligio.
  useEffect(() => {
    if (!hasSubmitted.current) return

    const tipo = submitted.tipoCongregacion
    setSelection(tipo === "vsn" || tipo === "nuevo" || tipo === "otra" ? tipo : null)

    if (tipo === "otra") {
      setComboQuery(submitted.congregacionQuery)
      setComboId(submitted.congregacionId)
    }
  }, [submitted])

  function handleComboboxChange(query: string, id: string) {
    setComboQuery(query)
    setComboId(id)
  }

  const [state, formAction, isPending] = useActionState(submitInscripcion, initialState)

  // El resultado del envio aparece lejos del boton (arriba del formulario, o
  // reemplazandolo entero). Sin mover el foco, quien navega con teclado o lector
  // de pantalla se queda parado en el submit y no se entera de que paso.
  const successRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLParagraphElement>(null)
  const hasSubmitted = useRef(false)

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
      tipoCongregacion: String(formData.get("tipoCongregacion") ?? ""),
    })
    hasSubmitted.current = true
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

  useEffect(() => {
    // Solo tras un envio real, y nunca mientras la action sigue corriendo: los dos
    // destinos se excluyen entre si, asi que a lo sumo uno esta montado.
    if (!hasSubmitted.current || isPending) return
      ; (successRef.current ?? alertRef.current)?.focus()
  }, [state, isPending])

  if (state.ok) {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="space-y-3 py-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]"
      >
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
          ref={alertRef}
          role="alert"
          tabIndex={-1}
          className="jec-label rounded-[6px] border-l-[3px] border-[var(--acento-texto)] bg-[color-mix(in_srgb,var(--acento)_10%,transparent)] px-4 py-3 text-sm text-[var(--dato)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)]"
        >
          {state.message}
        </p>
      ) : null}

      <Field label="Nombre y Apellido" htmlFor="nombre" error={state.fieldErrors?.nombre}>
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
          maxLength={13}
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

      <div
        role="group"
        aria-labelledby="congregacion-titulo"
        aria-describedby={state.fieldErrors?.tipoCongregacion ? "tipoCongregacion-error" : undefined}
        className="space-y-4"
      >
        {/* Ya no dice "(opcional)": la pagina declara que todo campo sin marca es
            obligatorio, y elegir una opcion aca ahora lo exige tambien el schema. */}
        <p
          id="congregacion-titulo"
          className="jec-label block text-xs font-bold uppercase tracking-[0.14em] text-[var(--suave)]"
        >
          Congregación
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--suave)]">
            <input
              type="checkbox"
              name="tipoCongregacion"
              value="vsn"
              checked={selection === "vsn"}
              onChange={() => setSelection("vsn")}
              className="h-4 w-4 rounded-[4px] border-[var(--regla)] bg-transparent accent-[var(--acento)] focus:ring-[var(--foco)]"
            />
            Soy de Vida Sobrenatural
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--suave)]">
            <input
              type="checkbox"
              name="tipoCongregacion"
              value="nuevo"
              checked={selection === "nuevo"}
              onChange={() => setSelection("nuevo")}
              className="h-4 w-4 rounded-[4px] border-[var(--regla)] bg-transparent accent-[var(--acento)] focus:ring-[var(--foco)]"
            />
            Soy nuevo
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--suave)]">
            <input
              type="checkbox"
              name="tipoCongregacion"
              value="otra"
              checked={selection === "otra"}
              onChange={() => setSelection("otra")}
              className="h-4 w-4 rounded-[4px] border-[var(--regla)] bg-transparent accent-[var(--acento)] focus:ring-[var(--foco)]"
            />
            Soy de otra congregación
          </label>
        </div>

        {state.fieldErrors?.tipoCongregacion ? (
          <p id="tipoCongregacion-error" className="flex items-center gap-1.5 text-sm text-[var(--acento-texto)]">
            <AlertIcon size={16} className="shrink-0" />
            {state.fieldErrors.tipoCongregacion}
          </p>
        ) : null}

        {selection === "otra" ? (
          <div className="space-y-2">
            <CongregacionCombobox
              congregaciones={otrasCongregaciones}
              query={comboQuery}
              selectedId={comboId}
              onChange={handleComboboxChange}
            />
            {state.fieldErrors?.congregacionQuery ? (
              <p className="flex items-center gap-1.5 text-sm text-[var(--acento-texto)]">
                <AlertIcon size={16} className="shrink-0" />
                {state.fieldErrors.congregacionQuery}
              </p>
            ) : null}
          </div>
        ) : null}
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
          className="flex items-center gap-1.5 text-sm text-[var(--acento-texto)]"
        >
          <AlertIcon size={16} className="shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
