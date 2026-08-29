import { AdminHeader } from "@/components/admin/admin-sidebar"
import { CongregacionesPanel } from "@/components/admin/congregaciones-panel"
import { obtenerCongregacionesAdmin } from "@/actions"
import { requireAdmin } from "@/lib/auth-guards"

export default async function CongregacionesPage() {
  await requireAdmin()
  const congregaciones = await obtenerCongregacionesAdmin()

  return (
    <>
      <AdminHeader
        title="Congregaciones"
        description="Curación de congregaciones cargadas por los visitantes"
      />
      <div className="flex flex-1 flex-col p-6">
        <CongregacionesPanel data={congregaciones} />
      </div>
    </>
  )
}
