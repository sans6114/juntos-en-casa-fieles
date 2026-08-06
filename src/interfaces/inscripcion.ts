import { z } from "zod"

export const CrearInscripcionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  edad: z.coerce.number().min(12, "Debe tener al menos 12 años").max(99, "Edad inválida"),
  congregacionId: z.string().optional().nullable(),
})

export type CrearInscripcionDTO = z.infer<typeof CrearInscripcionSchema>
