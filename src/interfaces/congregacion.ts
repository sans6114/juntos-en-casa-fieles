import { z } from "zod"

export type EstadoCongregacion = "PENDIENTE" | "APROBADA"

/**
 * Cómo se le nombra la congregación de alguien al colaborador que lo acredita.
 *
 * Vive acá y no en `lib/congregacion/etiqueta.ts` —que es quien la construye—
 * porque la pinta el escáner: `qr-scanner.tsx` lee `texto` y `pendiente`. Es una
 * forma de UI, y tenerla en `lib` obligaba a `interfaces/` a importar de `lib`,
 * que es la dependencia al revés.
 */
export type EtiquetaCongregacion = {
  texto: string
  /**
   * La congregación existe pero todavía no fue aprobada: alguien la escribió a
   * mano al inscribirse. El colaborador lo ve y avisa al admin, que la aprueba o
   * la rechaza desde /admin/congregaciones.
   */
  pendiente: boolean
}

export type CongregacionAdminDTO = {
  id: string
  nombre: string
  nombreNormalizado: string
  estado: EstadoCongregacion
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
