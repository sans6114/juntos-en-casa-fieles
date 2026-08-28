import { z } from "zod"

export const CrearInscripcionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  telefono: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(13, "El teléfono debe tener como máximo 13 caracteres"),
  edad: z.coerce.number().min(12, "Debe tener al menos 12 años").max(99, "Edad inválida"),
  congregacionId: z.string().optional().nullable(),
  // El texto tipeado en el combobox. Antes no estaba en el schema, asi que Zod lo
  // descartaba y una congregacion escrita a mano pero no seleccionada se guardaba
  // vacia, sin error y sin aviso. Ahora llega hasta la action, que decide si va a
  // `congregacionId` (eligio de la lista) o a `congregacionTexto` (la escribio).
  congregacionQuery: z.string().optional(),
})

export type CrearInscripcionDTO = z.infer<typeof CrearInscripcionSchema>

export type InscripcionActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Partial<Record<keyof CrearInscripcionDTO, string>>
}

export type InscripcionDTO = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  edad: number
  congregacionId: string | null
  /**
   * Nombre a mostrar. Sale de la relacion cuando hay FK, y del `congregacionTexto`
   * legacy como fallback cuando no la hay (filas anteriores a la normalizacion;
   * las altas nuevas siempre asignan la FK, ver `resolverCongregacionId`).
   */
  congregacionNombre: string | null
  /** `null` cuando la fila no tiene FK (legacy por `congregacionTexto`, o sin iglesia). */
  congregacionEstado: "PENDIENTE" | "APROBADA" | null
  /** Ver `esCandidatoPastoral` en `src/lib/contacto/es-candidato-pastoral.ts`. */
  puedeContactar: boolean
  createdAt: string
  contactado?: boolean
  contactoUsuarioNombre?: string | null
}

export type AsistenciaDTO = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  horaLlegada: string
}
