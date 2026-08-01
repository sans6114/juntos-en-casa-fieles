import { AdminHeader } from "@/components/admin/admin-sidebar"
import { UsuariosPanel } from "@/components/admin/usuarios-panel"
import { usuarios } from "@/lib/mock-data/usuarios"

export default function UsuariosPage() {
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
