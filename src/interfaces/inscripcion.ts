import { z } from "zod"

/**
 * Opcion declarada en el bloque de congregacion del formulario de inscripcion.
 * - `vsn`: es de la congregacion propia del evento (llega con FK resuelta).
 * - `nuevo`: declara que no tiene congregacion.
 * - `otra`: escribe o elige otra congregacion en el combobox.
 */
export const TipoCongregacionSchema = z.enum(["vsn", "nuevo", "otra"], {
  error: "Elegí una opción de congregación.",
})

export type TipoCongregacion = z.infer<typeof TipoCongregacionSchema>

export const CrearInscripcionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  // Se normaliza ANTES de validar, y es la unica forma en que el email entra a
  // la base. `Inscripcion.email` es `@unique` con indice sensible a mayusculas:
  // sin esto, "Ana@Mail.com" y "ana@mail.com" conviven como dos filas, y quien
  // se anoto con mayusculas escribe su mail en minuscula en /mi-qr (que es lo
  // que hace el teclado del celular), no aparece, intenta inscribirse de nuevo y
  // choca contra el unique. Queda sin QR y sin salida, en la pagina que existe
  // justamente para darle una. La migracion
  // 20260911120000_add_inscripcion_qr_token_y_estado_email normalizo las filas
  // que ya estaban.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().email("Debe ser un email válido")),
  telefono: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(13, "El teléfono debe tener como máximo 13 caracteres"),
  edad: z.coerce.number().min(12, "Debe tener al menos 12 años").max(99, "Edad inválida"),
  congregacionId: z.string().optional().nullable(),
  // El texto tipeado en el combobox. La action lo resuelve a una FK haciendo
  // upsert por `nombreNormalizado`: escribirla a mano y elegirla de la lista
  // terminan en la misma fila de `Congregacion`.
  congregacionQuery: z.string().optional(),
  // Cual de los tres checkboxes eligio el visitante. Obligatorio: sin esto no
  // se puede distinguir "no tengo congregacion" de "no conteste", y esa
  // ambiguedad es la que ensuciaba las metricas del panel. Ademas es la unica
  // via por la que una inscripcion nace con `sinCongregacion = true`.
  tipoCongregacion: TipoCongregacionSchema,
}).superRefine((data, ctx) => {
  // Marcar "otra congregacion" y dejar el campo vacio deja una fila en el limbo:
  // sin FK y sin el flag, invisible en el chart del panel. Se corta en el borde.
  if (
    data.tipoCongregacion === "otra" &&
    !data.congregacionId &&
    !data.congregacionQuery?.trim()
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Escribí o elegí tu congregación.",
      path: ["congregacionQuery"],
    })
  }
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
  /** Nombre a mostrar. Sale siempre de la relacion: la FK es la unica fuente. */
  congregacionNombre: string | null
  /** `null` cuando la fila no tiene FK. */
  congregacionEstado: "PENDIENTE" | "APROBADA" | null
  /**
   * El visitante declaro que no tiene congregacion ("Soy nuevo"). Es un dato
   * afirmado, distinto de "no hay FK": una fila puede quedar sin FK porque un
   * admin le rechazo la congregacion, y eso no la vuelve `sinCongregacion`.
   */
  sinCongregacion: boolean
  /** Ver `esCandidatoPastoral` en `src/lib/contacto/es-candidato-pastoral.ts`. */
  puedeContactar: boolean
  createdAt: string
  contactado?: boolean
  contactoUsuarioNombre?: string | null
  /**
   * Hora de acreditacion de cada dia, en ISO, o `null` si todavia no llego.
   * Viaja en la grilla porque el check manual de la puerta se hace inline en la
   * fila: mandarlo a la ficha dejaria al COLABORADOR sin poder acreditar al
   * 92% de la gente, porque solo puede abrir la ficha de candidatos pastorales.
   */
  asistenciaDia1: string | null
  asistenciaDia2: string | null
}

/**
 * Resultado del alta manual desde el admin. `yaInscripto` es el caso central:
 * el colaborador apurado en la puerta va a cargar gente que ya se anotó, y
 * devolverle un "email duplicado" a secas lo deja sin salida. Con el id a mano,
 * el diálogo puede ofrecerle acreditar a esa persona en el acto.
 */
export type AltaManualResult =
  | {
      ok: true
      inscripcionId: string
      nombre: string
      /** `true` si además quedó acreditada, porque hoy es día de evento. */
      acreditada: boolean
      horaLlegada?: string
    }
  | {
      ok: false
      message: string
      fieldErrors?: Partial<Record<keyof CrearInscripcionDTO, string>>
      yaInscripto?: { id: string; nombre: string }
    }

export type AsistenciaDTO = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  horaLlegada: string
}
