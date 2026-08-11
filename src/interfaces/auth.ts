import { z } from "zod"

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Debe ser un email válido"),
})

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "El enlace es inválido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>
