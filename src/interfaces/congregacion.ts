import { z } from "zod"

export type CongregacionAdminDTO = {
  id: string
  nombre: string
  nombreNormalizado: string
  estado: "PENDIENTE" | "APROBADA"
  totalInscripciones: number
  createdAt: string
}

export const RenombrarCongregacionSchema = z.object({
  id: z.string().min(1, "Falta el id de la congregación."),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
})

export type RenombrarCongregacionDTO = z.infer<typeof RenombrarCongregacionSchema>

export const FusionarCongregacionesSchema = z.object({
  duplicadaId: z.string().min(1, "Falta la congregación duplicada."),
  canonicaId: z.string().min(1, "Falta la congregación destino."),
})

export type FusionarCongregacionesDTO = z.infer<typeof FusionarCongregacionesSchema>
