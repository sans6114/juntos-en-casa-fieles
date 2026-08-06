import { AdminHeader } from "@/components/admin/admin-sidebar"
import { InscripcionesTable } from "@/components/admin/inscripciones-table"
import { obtenerInscripciones } from "@/actions"
import { requireSession } from "@/lib/auth-guards"

export default async function InscripcionesGrillaPage() {
  const user = await requireSession()
  const inscripciones = await obtenerInscripciones()
  const isAdmin = user.rol === "ADMIN"

  return (
    <>
      <AdminHeader
        title="Grilla de inscripciones"
        description="Listado paginado de todas las inscripciones registradas"
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {!isAdmin ? (
          <aside className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-base leading-relaxed text-amber-950 sm:px-5 print:hidden">
            <p className="font-semibold">Cómo contactar</p>
            <p className="mt-1 text-amber-900/90">
              Tocá el nombre de alguien marcado como{" "}
              <strong>Sin congregación</strong> (aparece el enlace “contactar”).
              En la ficha vas a poder escribir por WhatsApp, marcar contactado y
              dejar una observación.
            </p>
          </aside>
        ) : null}
        <InscripcionesTable data={inscripciones} isAdmin={isAdmin} />
      </div>
    </>
  )
}
