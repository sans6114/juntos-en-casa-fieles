/**
 * Gemela de `placas-upload/route.ts`: misma excepcion documentada al skill de
 * arquitectura (la mitad de `handleUpload` ES un webhook externo, y la emision
 * del token no tiene equivalente en un server action), y tampoco lee ni
 * escribe `Contenido` — `imagenSrc` llega a la base por
 * `crearContenido`/`actualizarContenido`, como cualquier otro string.
 *
 * Ruta separada y no un `allowedContentTypes` mas ancho en `placas-upload`
 * porque son dos semanticas con dos limites distintos: las placas son material
 * de descarga (20 MB, sin tocar), la miniatura es un thumbnail que el browser
 * ya redujo a ~100 KB con `optimizarThumb`.
 */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { requireCatalogoApi } from "@/lib/auth-guards"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // NUNCA requireAdmin(): llama redirect(), que TIRA NEXT_REDIRECT, y
        // dentro de este callback ese throw queda silenciado y termina en un
        // 400 generico. `requireCatalogoApi` aplica la misma regla tirando error.
        await requireCatalogoApi()

        return {
          // `image/png` es el fallback de `canvas.toBlob` en los browsers sin
          // soporte de WebP: ya viene reducido a 1280 px, asi que se acepta.
          allowedContentTypes: ["image/webp", "image/png"],
          // Backstop: lo que sale de `optimizarThumb` pesa dos ordenes de
          // magnitud menos. Este limite solo ataja un cliente manipulado.
          maximumSizeInBytes: 2 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 400 }
    )
  }
}
