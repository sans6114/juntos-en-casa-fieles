import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ResumenAsistencia } from "@/components/admin/resumen-asistencia"
import { obtenerNoAsistentes } from "@/actions"
import { requireAdmin } from "@/lib/auth-guards"

import { NoAsistentesClient } from "./ui/NoAsistentesClient"

export const metadata = {
  title: "No asistieron | Juntos en Casa",
}

/**
 * Seguimiento post-evento: a quién le falta que le escribamos.
 *
 * Es el reverso de `/admin/asistencias`, y a propósito no vive dentro de esa
 * pantalla: aquella responde "quién vino" mientras el evento pasa, y se mira
 * desde la puerta. Esta responde "a quién no vimos" cuando ya terminó, y lo que
 * se hace con ella es escribirle a la gente.
 *
 * `requireAdmin` —la lista completa con teléfonos de todos los que faltaron es
 * material de seguimiento coordinado, igual que `/admin/contacto`—.
 */
export default async function NoAsistentesPage() {
  await requireAdmin()

  const { personas, resumen } = await obtenerNoAsistentes()

  return (
    <>
      <AdminHeader
        title="No asistieron"
        description="Quiénes se inscribieron y faltaron, para poder contactarlos."
      />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* El panorama arriba y la lista abajo: primero cuánto se perdió, y
            recién después a quién hay que escribirle. */}
        <ResumenAsistencia resumen={resumen} />
        <NoAsistentesClient data={personas} />
      </div>
    </>
  )
}
