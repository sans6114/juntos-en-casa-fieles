import { notFound } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ContenidoForm } from "@/components/admin/contenido-form"
import { obtenerContenidos, obtenerRecursosVinculables } from "@/actions"

export default async function EditarContenidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // No existe una acción dedicada por-id: el catálogo es chico (design §B1)
  // y reusar el listado admin evita una 7ma acción para este único uso.
  const [contenidos, recursos] = await Promise.all([
    obtenerContenidos(),
    obtenerRecursosVinculables(),
  ])
  const contenido = contenidos.find((item) => item.id === id)
  if (!contenido) notFound()

  return (
    <>
      <AdminHeader
        title="Editar contenido"
        description={contenido.titulo}
      />
      <div className="flex flex-1 flex-col p-6">
        <ContenidoForm initialData={contenido} recursos={recursos} />
      </div>
    </>
  )
}
