import { notFound } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ProductoForm } from "@/components/admin/producto-form"
import { obtenerProductos, obtenerCategoriasProducto } from "@/actions"

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // No existe una acción dedicada por-id: el catálogo es chico (mirror de
  // contenidos/[id]/editar/page.tsx:12-13) y reusar el listado admin evita
  // una novena acción para este único uso.
  const [productos, categorias] = await Promise.all([
    obtenerProductos(),
    obtenerCategoriasProducto(),
  ])
  const producto = productos.find((item) => item.id === id)
  if (!producto) notFound()

  return (
    <>
      <AdminHeader
        title="Editar producto"
        description={producto.titulo}
      />
      <div className="flex flex-1 flex-col p-6">
        <ProductoForm initialData={producto} categorias={categorias} />
      </div>
    </>
  )
}
