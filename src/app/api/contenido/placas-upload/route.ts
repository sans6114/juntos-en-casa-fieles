/**
 * Excepción documentada a `nextjs-monolith-architecture/SKILL.md:92`
 * ("Add `app/api` routes only for protocol requirements (OAuth callbacks,
 * external webhooks)") — decisión A4 del design, reconocida explícitamente:
 *
 * 1. La mitad de esta ruta ES literalmente un webhook externo: `handleUpload`
 *    de `@vercel/blob/client` atiende dos eventos, `blob.generate-client-token`
 *    (desde el browser) y `blob.upload-completed` (un callback HTTP entrante
 *    DESDE los servidores de Vercel Blob) — el segundo es exactamente la
 *    excepción "external webhooks" del skill.
 * 2. La mitad de emisión de token no tiene equivalente en un server action:
 *    el browser necesita un bearer token en una respuesta HTTP antes de
 *    poder hablar con el origen de terceros (Vercel Blob).
 * 3. No cae en la columna prohibida del skill ("CRUD mirror of actions"):
 *    esta ruta nunca lee ni escribe `Contenido`. `placasUrl` llega a la base
 *    de datos a través de `crearContenido`/`actualizarContenido`, como
 *    cualquier otro campo string.
 *
 * `onUploadCompleted` se deja como no-op: no tiene trabajo que hacer (la URL
 * viaja con el resto del form hasta el server action) y en desarrollo local
 * Vercel Blob no puede alcanzar `localhost`, así que un no-op no depende de
 * un callback que nunca va a llegar.
 */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth-guards"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // NUNCA requireAdmin(): llama redirect(), que TIRA NEXT_REDIRECT, y
        // dentro de este callback ese throw queda silenciado y termina en un
        // 400 genérico. `requireAdminApi` aplica la misma regla tirando error.
        await requireAdminApi()

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20 MB (decisión 10)
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
