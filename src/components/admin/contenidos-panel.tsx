"use client"

import { useTransition } from "react"
import Link from "next/link"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"
import { toggleContenidoPublicado } from "@/actions"
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
import { kindLabel, TIPO_A_KIND } from "@/interfaces/contenido"
import type { ContenidoAdminDTO } from "@/interfaces/contenido"
import { cn } from "@/lib/utils"

type ContenidosPanelProps = {
  data: ContenidoAdminDTO[]
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function ContenidosPanel({ data }: ContenidosPanelProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (id: string, publicado: boolean) => {
    startTransition(async () => {
      const result = await toggleContenidoPublicado(id)
      if (result.ok) {
        toast.success(publicado ? "Contenido despublicado" : "Contenido publicado")
      } else {
        toast.error(result.message ?? "No se pudo actualizar")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contenidos</h2>
          <p className="text-sm text-muted-foreground">
            Prédicas, videos y recursos del catálogo público
          </p>
        </div>
        <Link href="/admin/contenidos/nuevo" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="size-4" />
          Nuevo contenido
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Edición</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay contenidos cargados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((contenido) => (
                <TableRow
                  key={contenido.id}
                  className={!contenido.publicado ? "opacity-60" : undefined}
                >
                  <TableCell className="font-medium">{contenido.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{kindLabel(TIPO_A_KIND[contenido.tipo])}</Badge>
                  </TableCell>
                  <TableCell>{contenido.edicion}</TableCell>
                  <TableCell>
                    <Badge variant={contenido.publicado ? "default" : "outline"}>
                      {contenido.publicado ? "Publicado" : "Sin publicar"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(contenido.createdAt)}</TableCell>
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
                          render={<Link href={`/admin/contenidos/${contenido.id}/editar`} />}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant={contenido.publicado ? "destructive" : "default"}
                          onClick={() => handleToggle(contenido.id, contenido.publicado)}
                        >
                          {contenido.publicado ? "Despublicar" : "Publicar"}
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
