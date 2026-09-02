import { z } from "zod"

/**
 * Valores del enum Prisma `TipoContenido`/`CampoThumb`, declarados acá como
 * unions de string (sin importar Prisma) para que este archivo se pueda
 * importar desde un componente "use client" — precedente:
 * `usuarios-panel.tsx:34` importa `@/interfaces/usuario`, que ya usa Zod.
 */
export type TipoContenido = "PREDICA" | "VIDEO" | "RECURSOS"
export type CampoThumb = "CAMPO_PAPEL" | "CAMPO_TINTA" | "CAMPO_FUEGO"

/** Kind presentacional público, usado por el catálogo y por la vista previa del admin. */
export type ContenidoKind = "predica" | "video" | "recursos"

export type ContenidoThumbVista = {
  field: "campo-papel" | "campo-tinta" | "campo-fuego"
  src?: string
  /** "contain" mantiene el asset completo; "cover" llena el marco. */
  fit?: "contain" | "cover"
  /** Oscurece un asset "cover" para que el badge de play siga siendo legible. */
  dim?: boolean
}

/** Exactamente lo que necesita el gráfico de la card — y nada más. */
export type ContenidoVista = {
  title: string
  description: string
  kind: ContenidoKind
  thumb: ContenidoThumbVista
  session?: string
  speaker?: string
  durationLabel?: string
  placasCount?: number
}

export type ContenidoPublicoDTO = ContenidoVista & {
  id: string
  slug: string
  edition: number
  youtubeId?: string
  placasUrl?: string
}

/** Fila completa tal como la consume el panel de administración. */
export type ContenidoAdminDTO = {
  id: string
  slug: string
  titulo: string
  descripcion: string
  tipo: TipoContenido
  edicion: number
  sesion?: string
  orador?: string
  youtubeId?: string
  duracion?: string
  placasUrl?: string
  placasCount?: number
  campo: CampoThumb
  imagenSrc?: string
  imagenCover: boolean
  imagenAtenuada: boolean
  publicado: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Un mapa, dos consumidores: el mapper server-side (`src/lib/data/contenidos.ts`)
 * y la vista previa en vivo del admin (client component), evitando que
 * diverjan (A2).
 */
export const TIPO_A_KIND: Record<TipoContenido, ContenidoKind> = {
  PREDICA: "predica",
  VIDEO: "video",
  RECURSOS: "recursos",
}

export const CAMPO_A_CLASE: Record<CampoThumb, ContenidoThumbVista["field"]> = {
  CAMPO_PAPEL: "campo-papel",
  CAMPO_TINTA: "campo-tinta",
  CAMPO_FUEGO: "campo-fuego",
}

const KIND_LABEL: Record<ContenidoKind, string> = {
  predica: "Prédica",
  video: "Video",
  recursos: "Recursos",
}

export function kindLabel(kind: ContenidoKind): string {
  return KIND_LABEL[kind]
}

/**
 * `imagenSrc` acepta DOS formas, y las dos son necesarias:
 *
 * 1. Una URL de Vercel Blob: lo que sube el admin desde su file system. Es la
 *    unica forma que el panel puede producir hoy — el `<Select>` de assets
 *    curados ya no existe.
 * 2. Una ruta relativa `/jec/...`: filas viejas, anteriores al upload. NO es
 *    convivencia en la UI (no hay forma de elegir una de esas desde el panel):
 *    es compatibilidad de datos. Sin esta rama, editar un contenido viejo
 *    fallaria la validacion aunque nadie haya tocado la imagen.
 */
const RUTA_ASSET_LEGACY = /^\/jec\/[\w./-]+$/
const URL_BLOB = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/\S+$/i

/** Normaliza un input de texto opcional: "" (sin tocar) llega como `undefined`. */
const textoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))

const contenidoBase = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo admite minúsculas, números y guiones"),
  titulo: z.string().trim().min(1, "El título es obligatorio"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  tipo: z.enum(["PREDICA", "VIDEO", "RECURSOS"], "Elegí un tipo de contenido"),
  edicion: z.coerce.number().int("La edición debe ser un número entero"),
  sesion: textoOpcional,
  orador: textoOpcional,
  youtubeId: textoOpcional,
  duracion: textoOpcional,
  placasUrl: textoOpcional,
  placasCount: z.number().int().optional(),
  campo: z.enum(["CAMPO_PAPEL", "CAMPO_TINTA", "CAMPO_FUEGO"], "Elegí un campo de fondo"),
  imagenSrc: textoOpcional.refine(
    (v) => v === undefined || URL_BLOB.test(v) || RUTA_ASSET_LEGACY.test(v),
    "La miniatura tiene que subirse desde el panel"
  ),
  imagenCover: z.boolean(),
  imagenAtenuada: z.boolean(),
  publicado: z.boolean(),
})

function reglasPorTipo(data: z.infer<typeof contenidoBase>, ctx: z.RefinementCtx) {
  if (data.tipo === "PREDICA" && !data.orador) {
    ctx.addIssue({ code: "custom", path: ["orador"], message: "Una prédica necesita el orador" })
  }
  if (data.tipo === "VIDEO" && !data.youtubeId) {
    ctx.addIssue({
      code: "custom",
      path: ["youtubeId"],
      message: "Un video necesita el id de YouTube",
    })
  }
  if (data.youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(data.youtubeId)) {
    ctx.addIssue({
      code: "custom",
      path: ["youtubeId"],
      message: "Pegá solo el id del video, no la URL completa",
    })
  }
  if (data.tipo === "RECURSOS" && !data.placasUrl) {
    ctx.addIssue({
      code: "custom",
      path: ["placasUrl"],
      message: "Un recurso necesita el PDF de placas",
    })
  }
}

export const CrearContenidoSchema = contenidoBase.superRefine(reglasPorTipo)
export const ActualizarContenidoSchema = contenidoBase
  .extend({ id: z.string().min(1, "Falta el id del contenido") })
  .superRefine(reglasPorTipo)

export type CrearContenidoDTO = z.infer<typeof CrearContenidoSchema>
export type ActualizarContenidoDTO = z.infer<typeof ActualizarContenidoSchema>
