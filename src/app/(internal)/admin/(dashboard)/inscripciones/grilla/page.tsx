import { AdminHeader } from "@/components/admin/admin-sidebar"
import { AltaInscripcionDialog } from "@/components/admin/alta-inscripcion-dialog"
import { InscripcionesTable } from "@/components/admin/inscripciones-table"
import { obtenerCongregaciones, obtenerInscripciones } from "@/actions"
import {
  diaEventoDeHoy,
  diaYaOcurrio,
  DIAS_EVENTO,
  FechasEventoNoConfiguradas,
} from "@/lib/asistencia/dia-evento"
import { requireSession } from "@/lib/auth-guards"
import type { DiaEvento } from "@/interfaces/asistencia"

export default async function InscripcionesGrillaPage() {
  const user = await requireSession()
  const [inscripciones, congregaciones] = await Promise.all([
    obtenerInscripciones(),
    obtenerCongregaciones(),
  ])
  const isAdmin = user.rol === "ADMIN"

  // Si faltan las fechas, la página NO se cae: es la herramienta de búsqueda de
  // la puerta y tirar acá dejaría al equipo sin nada. Pero tampoco se calla: sin
  // el aviso, el botón de acreditar simplemente no aparecería y nadie sabría
  // por qué, que es exactamente el fallo silencioso que vinimos a eliminar.
  let diaDeHoy: DiaEvento | null = null
  // Los días que ya empezaron son los únicos que se pueden marcar como
  // presentes. Se resuelve acá, en el servidor, porque depende de variables de
  // entorno; la celda solo recibe el resultado. Si faltan las fechas queda
  // vacío y no se ofrece marcar nada, igual que no aparece el botón de
  // acreditar.
  let diasHabilitados: DiaEvento[] = []
  let fechasSinConfigurar = false
  try {
    diaDeHoy = diaEventoDeHoy()
    diasHabilitados = DIAS_EVENTO.filter((dia) => diaYaOcurrio(dia))
  } catch (error) {
    if (error instanceof FechasEventoNoConfiguradas) {
      console.error(error)
      fechasSinConfigurar = true
    } else {
      throw error
    }
  }

  return (
    <>
      <AdminHeader
        title="Grilla de inscripciones"
        description="Buscá a una persona por nombre o email y acreditala, con o sin QR."
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {fechasSinConfigurar ? (
          <aside
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-4 text-base leading-relaxed sm:px-5 print:hidden"
          >
            <p className="font-semibold">No se puede acreditar</p>
            <p className="mt-1">
              Faltan las fechas del evento en la configuración del servidor
              (<code>EVENT_DAY_1</code> y <code>EVENT_DAY_2</code>). Avisale al
              administrador: hasta que estén cargadas, el botón de acreditar no
              aparece.
            </p>
          </aside>
        ) : null}

        {!isAdmin ? (
          <aside className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-base leading-relaxed text-amber-950 sm:px-5 print:hidden">
            <p className="font-semibold">Cómo usar esta grilla</p>
            <p className="mt-1 text-amber-900/90">
              <strong>Para acreditar:</strong> buscá a la persona y tocá{" "}
              <strong>Acreditar</strong> en su fila. Sirve igual que el escáner,
              para quien llega sin QR. Si te equivocaste, el menú{" "}
              <strong>···</strong> permite corregir cada día.
            </p>
            <p className="mt-2 text-amber-900/90">
              <strong>Para contactar:</strong> tocá el nombre de alguien marcado
              como <strong>Sin congregación</strong> (aparece el enlace
              “contactar”). En la ficha vas a poder escribir por WhatsApp, marcar
              contactado y dejar una observación.
            </p>
          </aside>
        ) : null}

        <div className="flex justify-end print:hidden">
          <AltaInscripcionDialog
            congregaciones={congregaciones}
            esDiaDeEvento={diaDeHoy !== null}
          />
        </div>

        <InscripcionesTable
          data={inscripciones}
          isAdmin={isAdmin}
          diaDeHoy={diaDeHoy}
          diasHabilitados={diasHabilitados}
        />
      </div>
    </>
  )
}
