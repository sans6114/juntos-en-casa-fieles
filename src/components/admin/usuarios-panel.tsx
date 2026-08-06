"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"
import { crearColaborador, toggleUsuarioActivo } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { UsuarioDTO } from "@/interfaces/usuario"

type UsuariosPanelProps = {
  data: UsuarioDTO[]
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function UsuariosPanel({ data }: UsuariosPanelProps) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()

  const resetForm = () => {
    setNombre("")
    setEmail("")
    setPassword("")
  }

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await crearColaborador({ nombre, email, password })
      if (result.ok) {
        toast.success("Colaborador creado")
        resetForm()
        setOpen(false)
      } else {
        toast.error(result.message ?? "No se pudo crear")
      }
    })
  }

  const handleToggle = (userId: string, activo: boolean) => {
    startTransition(async () => {
      const result = await toggleUsuarioActivo(userId)
      if (result.ok) {
        toast.success(activo ? "Usuario desactivado" : "Usuario activado")
      } else {
        toast.error(result.message ?? "No se pudo actualizar")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Colaboradores</h2>
          <p className="text-sm text-muted-foreground">
            Usuarios con acceso al portal administrativo
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="size-4" />
                Nuevo colaborador
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear colaborador</DialogTitle>
              <DialogDescription>
                Completa los datos para dar de alta un nuevo usuario con rol colaborador.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej. Ana Martínez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ana.martinez@juntosencasa.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isPending}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creando..." : "Crear colaborador"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((usuario) => (
                <TableRow key={usuario.id} className={!usuario.activo ? "opacity-60" : undefined}>
                  <TableCell className="font-medium">{usuario.nombre}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{usuario.rol}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.activo ? "default" : "outline"}>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(usuario.createdAt)}</TableCell>
                  <TableCell>
                    {usuario.rol === "COLABORADOR" ? (
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
                            variant={usuario.activo ? "destructive" : "default"}
                            onClick={() => handleToggle(usuario.id, usuario.activo)}
                          >
                            {usuario.activo ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
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
