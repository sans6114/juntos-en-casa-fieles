import { z } from "zod"

export const RegistrarContactoSchema = z.object({
  inscripcionId: z.string().min(1),
  contactado: z.boolean(),
  observacion: z.string().max(2000).optional().nullable(),
})

export type RegistrarContactoDTO = z.infer<typeof RegistrarContactoSchema>

export type ContactoDTO = {
  id: string
  inscripcionId: string
  contactado: boolean
  observacion: string | null
  contactadoAt: string | null
  usuarioId: string
  usuarioNombre: string
  usuarioEmail: string
}
