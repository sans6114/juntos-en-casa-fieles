import { z } from "zod"

export const CrearColaboradorSchema = z
  .object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Debe ser un email válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener entre 6 y 10 caracteres")
      .max(10, "La contraseña debe tener entre 6 y 10 caracteres")
      .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
      .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula")
      .regex(/[0-9]/, "La contraseña debe tener al menos un número")
      .regex(/[^A-Za-z0-9]/, "La contraseña debe tener al menos un caracter especial"),
    confirmPassword: z.string().min(1, "Debe confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
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
