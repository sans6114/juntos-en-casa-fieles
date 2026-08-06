import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { obtenerInscripcionPorId } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ContactoForm } from "./ui/ContactoForm"

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export default async function InscripcionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inscripcion = await obtenerInscripcionPorId(id)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <Link
          href="/admin/inscripciones/grilla"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "h-10 w-fit gap-2 px-3 text-base"
          )}
        >
          <ArrowLeft className="size-5" />
          Volver a la grilla
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Ficha de inscripción
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {inscripcion.nombre}
          </h1>
          <p className="mt-2 text-lg text-stone-600">
            {inscripcion.puedeContactar
              ? "Sin iglesia asignada — podés gestionar el contacto acá."
              : "Ya tiene congregación — el contacto pastoral no aplica."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-stone-900">Datos</h2>
          <dl className="mt-5 space-y-4 text-lg">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-stone-500">Email</dt>
              <dd className="font-medium text-stone-900 sm:text-right">
                {inscripcion.email}
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-stone-500">Teléfono</dt>
              <dd className="font-medium text-stone-900 sm:text-right">
                {inscripcion.telefono ?? "Sin teléfono"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-stone-500">Edad</dt>
              <dd className="font-medium text-stone-900 sm:text-right">
                {inscripcion.edad} años
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-stone-500">Congregación</dt>
              <dd className="sm:text-right">
                {inscripcion.congregacionNombre ? (
                  <Badge variant="secondary" className="text-sm">
                    {inscripcion.congregacionNombre}
                  </Badge>
                ) : (
                  <span className="font-medium text-amber-700">Sin congregación</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-stone-500">Fecha de inscripción</dt>
              <dd className="font-medium text-stone-900 sm:text-right">
                {formatDate(inscripcion.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        {inscripcion.puedeContactar ? (
          <ContactoForm
            inscripcionId={inscripcion.id}
            telefono={inscripcion.telefono}
            nombre={inscripcion.nombre}
            initialContactado={inscripcion.contacto?.contactado ?? false}
            initialObservacion={inscripcion.contacto?.observacion ?? ""}
            colaboradorActual={inscripcion.contacto?.usuarioNombre ?? null}
          />
        ) : (
          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-stone-900">
              Contacto no disponible
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-stone-600">
              Esta persona ya tiene una iglesia. El seguimiento de contacto solo
              es para quienes se anotaron sin congregación.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
