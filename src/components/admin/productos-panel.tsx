"use client"

import { useTransition } from "react"
import Link from "next/link"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"
import { toggleProductoPublicado } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ProductoAdminDTO } from "@/interfaces/producto"
import { cn } from "@/lib/utils"

type ProductosPanelProps = {
  data: ProductoAdminDTO[]
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function ProductosPanel({ data }: ProductosPanelProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (id: string, publicado: boolean) => {
    startTransition(async () => {
      const result = await toggleProductoPublicado(id)
      if (result.ok) {
        toast.success(publicado ? "Producto despublicado" : "Producto publicado")
      } else {
        toast.error(result.message ?? "No se pudo actualizar")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">
            Piezas del catálogo público de productos
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="size-4" />
          Nuevo producto
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay productos cargados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((producto) => (
                <TableRow
                  key={producto.id}
                  className={!producto.publicado ? "opacity-60" : undefined}
                >
                  <TableCell className="font-medium">{producto.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{producto.categoriaNombre}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={producto.publicado ? "default" : "outline"}>
                      {producto.publicado ? "Publicado" : "Sin publicar"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(producto.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" disabled={isPending}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/admin/productos/${producto.id}/editar`} />}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant={producto.publicado ? "destructive" : "default"}
                          onClick={() => handleToggle(producto.id, producto.publicado)}
                        >
                          {producto.publicado ? "Despublicar" : "Publicar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
