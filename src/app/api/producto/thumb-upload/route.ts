/**
 * Gemela de `api/contenido/thumb-upload/route.ts`: misma excepción documentada
 * al skill de arquitectura (la mitad de `handleUpload` ES un webhook externo,
 * y la emisión del token no tiene equivalente en un server action), y
 * tampoco lee ni escribe `Producto` — `imagenSrc` llega a la base por
 * `crearProducto`/`actualizarProducto`, como cualquier otro string.
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
        // 400 genérico. `requireCatalogoApi` aplica la misma regla tirando error.
        await requireCatalogoApi()

        return {
          // `image/png` es el fallback de `canvas.toBlob` en los browsers sin
          // soporte de WebP: ya viene reducido a 1280 px, así que se acepta.
          allowedContentTypes: ["image/webp", "image/png"],
          // Backstop: lo que sale de `optimizarThumb` pesa dos órdenes de
          // magnitud menos. Este límite solo ataja un cliente manipulado.
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
