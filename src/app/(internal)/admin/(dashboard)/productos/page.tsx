import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ProductosPanel } from "@/components/admin/productos-panel"
import { obtenerProductos } from "@/actions"
import { requireCatalogo } from "@/lib/auth-guards"

export default async function ProductosPage() {
  await requireCatalogo()
  const productos = await obtenerProductos()

  return (
    <>
      <AdminHeader
        title="Productos"
        description="Piezas del catálogo público de productos"
      />
      <div className="flex flex-1 flex-col p-6">
        <ProductosPanel data={productos} />
      </div>
    </>
  )
}
