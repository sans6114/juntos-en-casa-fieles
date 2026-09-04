import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ProductoForm } from "@/components/admin/producto-form"
import { obtenerCategoriasProducto } from "@/actions"

export default async function NuevoProductoPage() {
  const categorias = await obtenerCategoriasProducto()

  return (
    <>
      <AdminHeader
        title="Nuevo producto"
        description="Cargá una pieza para el catálogo público de productos"
      />
      <div className="flex flex-1 flex-col p-6">
        <ProductoForm categorias={categorias} />
      </div>
    </>
  )
}
