import { z } from "zod"

export const CrearColaboradorSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type CrearColaboradorDTO = z.infer<typeof CrearColaboradorSchema>

export type UsuarioDTO = {
  id: string
  nombre: string
  email: string
  rol: "ADMIN" | "COLABORADOR"
  activo: boolean
  createdAt: string
}
