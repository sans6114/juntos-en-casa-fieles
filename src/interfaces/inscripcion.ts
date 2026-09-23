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

const CamposInscripcion = z.object({
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
})

// Marcar "otra congregacion" y dejar el campo vacio deja una fila en el limbo:
// sin FK y sin el flag, invisible en el chart del panel. Se corta en el borde.
// Se define aparte para que las dos variantes del formulario compartan la regla
// en vez de tener cada una su copia.
function exigirCongregacionCuandoEsOtra(
  data: { tipoCongregacion: TipoCongregacion; congregacionId?: string | null; congregacionQuery?: string },
  ctx: z.RefinementCtx
) {
  if (data.tipoCongregacion === "otra" && !data.congregacionId && !data.congregacionQuery?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Escribí o elegí tu congregación.",
      path: ["congregacionQuery"],
    })
  }
}

export const CrearInscripcionSchema = CamposInscripcion.superRefine(exigirCongregacionCuandoEsOtra)

export type CrearInscripcionDTO = z.infer<typeof CrearInscripcionSchema>

/**
 * Variante para el alta que hace el colaborador en la puerta.
 *
 * La ÚNICA diferencia es que el email no se pide: la persona ya está entrando y
 * se la acredita en el acto, así que el mail no cumple ninguna función en ese
 * flujo. Exigirlo obligaba a inventar una dirección con gente esperando, que
 * ensucia los datos peor que dejarlo vacío.
 *
 * Vacío se guarda como `null` y no como cadena vacía: dos altas sin mail con `""`
 * chocarían contra el índice único, mientras que Postgres trata cada NULL como
 * distinto. Si escriben algo, se valida y normaliza igual que en el público.
 */
export const CrearInscripcionManualSchema = CamposInscripcion.extend({
  email: z
    .preprocess(
      (valor) => (typeof valor === "string" ? valor.trim().toLowerCase() : valor),
      z
        .union([
          z.literal(""),
          z.string().email("Escribí un email válido o dejá el campo vacío."),
        ])
        .optional()
    )
    .transform((valor) => valor || null),
}).superRefine(exigirCongregacionCuandoEsOtra)

export type CrearInscripcionManualDTO = z.infer<typeof CrearInscripcionManualSchema>

export type InscripcionActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Partial<Record<keyof CrearInscripcionDTO, string>>
}

export type InscripcionDTO = {
  id: string
  nombre: string
  /** `null` en las altas de puerta, donde el mail no se pide. */
  email: string | null
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
  /**
   * URL permanente del QR de esta persona. Se arma en el servidor con
   * `urlDelQr()` en vez de mandar el token suelto, para que el cliente no tenga
   * que conocer la base del sitio ni rearmarla.
   */
  qrUrl: string
  /**
   * Link de WhatsApp con el recordatorio ya escrito, o `null` si el teléfono no
   * sirve. Se arma en el servidor por lo mismo que `qrUrl`: el cliente no tiene
   * por qué conocer las fechas del evento ni la dirección.
   */
  whatsappUrl: string | null
  /** Último envío exitoso del QR, en ISO. `null` = nunca llegó a destino. */
  emailEnviadoAt: string | null
  /** Último error de envío. Se limpia cuando un envío sale bien. */
  emailError: string | null
  /** Cuándo se le mandó el recordatorio previo al evento, en ISO. */
  recordatorioEnviadoAt: string | null
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
      fieldErrors?: Partial<Record<keyof CrearInscripcionManualDTO, string>>
      yaInscripto?: { id: string; nombre: string }
    }

export const RecuperarQrSchema = z.object({
  // Misma normalización que el alta: la búsqueda tiene que encontrar a quien se
  // anotó con mayúsculas aunque escriba su mail en minúscula.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().email("Escribí un email válido")),
})

/**
 * Los estados posibles de una recuperación. Se modelan explícitos —y no como un
 * `{ ok, message }`— porque la página tiene que pintar cinco cosas distintas, y
 * dos de ellas piden acciones opuestas: ante un límite de intentos hay que
 * esperar, ante un fallo real hay que reintentar. Con el mismo texto, la gente
 * reintenta cuando no debe.
 */
export type RecuperarQrResult =
  /** `qrValue` es el `id`: el mismo código que ya está en su mail, no uno nuevo. */
  | { estado: "encontrado"; qrValue: string }
  | { estado: "no-encontrado"; email: string }
  | { estado: "invalido"; message: string }
  | { estado: "limitado"; message: string }
  | { estado: "error"; message: string }

export type AsistenciaDTO = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  horaLlegada: string
}

/**
 * Alguien que se inscribió y faltó al menos un día.
 *
 * Los dos campos de asistencia viajan como `string | null` y no como un
 * "vino/no vino" ya resuelto: de esas dos nulidades salen los TRES grupos que
 * se muestran, y resolverlo en el servidor obligaría a mandar la misma persona
 * dos veces —quien nunca vino falta a los dos días— o a pedir tres consultas
 * para lo que es una sola.
 */
export type NoAsistenteDTO = {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  edad: number
  /** `null` cuando no vino ese día; la hora ISO cuando sí. */
  asistenciaDia1: string | null
  asistenciaDia2: string | null
  congregacionNombre: string | null
  /** Declaró "soy nuevo". Es el candidato pastoral: se anotó y no apareció. */
  sinCongregacion: boolean
  /**
   * Link de WhatsApp al número, SIN texto prellenado. A diferencia del
   * recordatorio previo al evento, acá cada mensaje lo escribe la persona que
   * contacta: el seguimiento es una conversación, no un aviso.
   *
   * `null` cuando el teléfono no se puede normalizar.
   */
  whatsappUrl: string | null
}

/**
 * El panorama completo de asistencia, en cuatro grupos que SÍ son excluyentes y
 * SÍ suman el total.
 *
 * Existe aparte de la lista porque la lista no puede contarlo: quien vino los
 * dos días no aparece en esta pantalla, y sin ese número no se puede decir qué
 * parte del total representa cada grupo.
 */
export type ResumenAsistencia = {
  totalInscriptos: number
  /** No vino ningún día. */
  nunca: number
  soloDia1: number
  soloDia2: number
  ambosDias: number
}

export type NoAsistentesResult = {
  personas: NoAsistenteDTO[]
  resumen: ResumenAsistencia
}
