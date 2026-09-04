import { del } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { esUrlDeBlob } from "@/interfaces/contenido"

/**
 * Borra de Vercel Blob los archivos que un update dejó sin referencia.
 *
 * `upload()` sube el archivo en el momento en que el admin lo elige, mucho
 * antes del submit, así que reemplazar una miniatura/foto o quitar un archivo
 * de la lista dejaba el blob viejo pagando storage para siempre.
 *
 * Corre DESPUÉS del update a propósito: así la consulta de referencias ve el
 * estado final, y una URL que otra fila todavía usa se salva sola. Eso cubre
 * el caso raro de un cliente manipulado que mandó la URL de otro contenido.
 *
 * Nunca tira: la fila ya se guardó bien, y un fallo de Blob no puede
 * convertir un update exitoso en un error para el admin. Peor caso, queda un
 * huérfano que junta el barrido de `prisma/scripts/limpiar-blobs-huerfanos.ts`.
 *
 * D7 — movido acá desde `actualizar-contenido.ts` y extendido a las tres
 * tablas que pueden referenciar un blob (`contenidoArchivo`, `contenido`,
 * `producto`): con dos dominios guardando URLs de Blob, un conteo que solo
 * mirara dos tablas podía borrar el blob que el tercero todavía necesita.
 */
export async function borrarBlobsSinReferencia(candidatas: string[]) {
  const urls = [...new Set(candidatas.filter((url) => url && esUrlDeBlob(url)))]
  if (urls.length === 0) return

  const huerfanas: string[] = []
  for (const url of urls) {
    const [enArchivos, enContenidos, enProductos] = await Promise.all([
      prisma.contenidoArchivo.count({ where: { url } }),
      prisma.contenido.count({ where: { imagenSrc: url } }),
      prisma.producto.count({ where: { imagenSrc: url } }),
    ])
    if (enArchivos === 0 && enContenidos === 0 && enProductos === 0) huerfanas.push(url)
  }

  if (huerfanas.length === 0) return

  try {
    await del(huerfanas)
  } catch (error) {
    console.error("No se pudieron borrar blobs huérfanos:", huerfanas, error)
  }
}
