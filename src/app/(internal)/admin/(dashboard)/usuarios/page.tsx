import { AdminHeader } from "@/components/admin/admin-sidebar"
import { UsuariosPanel } from "@/components/admin/usuarios-panel"
import { obtenerUsuarios } from "@/actions"
import { requireAdmin } from "@/lib/auth-guards"

export default async function UsuariosPage() {
  await requireAdmin()
  const usuarios = await obtenerUsuarios()

  return (
    <>
      <AdminHeader
        title="Usuarios"
        description="Gestión de colaboradores con acceso al portal administrativo"
      />
      <div className="flex flex-1 flex-col p-6">
        <UsuariosPanel data={usuarios} />
      </div>
    </>
  )
}
