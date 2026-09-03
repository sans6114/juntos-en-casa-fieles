/**
 * Reduce en el browser la imagen que el admin elige como miniatura, ANTES de
 * subirla a Vercel Blob. Sin esto, una foto de camara de 6 MB viaja entera y
 * queda ocupando storage para siempre.
 *
 * Por que 1280 px: la miniatura se renderiza como maximo a ~371 CSS px
 * (`max-w-6xl` = 1152, `lg:grid-cols-3`, `gap-5` en `ContenidosGrid`), asi que
 * con DPR 2 el optimizador de `next/image` nunca pide mas que la entrada de
 * 828 del srcset. 1280 deja margen si el diseno crece, sin costo relevante.
 *
 * OJO: esto es SOLO para la miniatura. Los archivos de placas (PDF y JPG) NO
 * pasan por aca: son material de descarga y bajarles la resolucion los
 * arruina — un fondo de pantalla de 1280 px no sirve para nada.
 */

const ANCHO_MAXIMO = 1280
const CALIDAD = 0.82

/**
 * `image/webp` es el objetivo, pero no todo browser lo soporta en
 * `canvas.toBlob`: los que no, caen en `image/png` en silencio. Se aceptan los
 * dos y el nombre del archivo se deriva del tipo REAL producido, para que el
 * `contentType` que ve Blob coincida con el contenido. La ruta de upload
 * admite ambos por la misma razon.
 */
const TIPOS_SALIDA: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
}

function nombreDeSalida(original: string, mime: string): string {
  const base = original.replace(/\.[^./\\]+$/, "") || "miniatura"
  return `${base}.${TIPOS_SALIDA[mime] ?? "png"}`
}

/**
 * Devuelve un `File` listo para `upload()`. Tira si el archivo no se puede
 * decodificar como imagen: a diferencia del conteo de paginas de un PDF, aca
 * un fallo NO es recuperable, porque sin la conversion no hay nada que subir.
 */
export async function optimizarThumb(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("No pudimos leer esa imagen. Probá con un JPG, PNG o WebP.")
  }

  try {
    // Nunca agranda: una imagen mas chica que el maximo se re-encoda tal cual.
    const escala = Math.min(1, ANCHO_MAXIMO / bitmap.width)
    const ancho = Math.max(1, Math.round(bitmap.width * escala))
    const alto = Math.max(1, Math.round(bitmap.height * escala))

    const canvas = document.createElement("canvas")
    canvas.width = ancho
    canvas.height = alto

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No pudimos procesar la imagen en este navegador.")

    ctx.drawImage(bitmap, 0, 0, ancho, alto)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", CALIDAD)
    })

    if (!blob) throw new Error("No pudimos convertir la imagen.")

    const mime = blob.type in TIPOS_SALIDA ? blob.type : "image/png"

    return new File([blob], nombreDeSalida(file.name, mime), { type: mime })
  } finally {
    bitmap.close()
  }
}
