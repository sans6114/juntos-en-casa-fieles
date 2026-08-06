const encoder = new TextEncoder()

async function getCryptoKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

function bufToB64Url(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
  const binary = String.fromCharCode(...arr)
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

function b64UrlToBuf(str: string): Uint8Array {
  const base64 = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
  const pad = (4 - (base64.length % 4)) % 4
  const padded = base64 + "=".repeat(pad)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function signSession(payload: any, secret: string): Promise<string> {
  const header = bufToB64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })))
  const data = bufToB64Url(encoder.encode(JSON.stringify(payload)))
  const key = await getCryptoKey(secret)
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${header}.${data}`)
  )
  const signatureB64Url = bufToB64Url(signature)
  return `${header}.${data}.${signatureB64Url}`
}

export async function verifySession(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const [header, data, signatureB64Url] = parts
    const key = await getCryptoKey(secret)
    const expectedSig = b64UrlToBuf(signatureB64Url)
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      expectedSig as any,
      encoder.encode(`${header}.${data}`) as any
    )
    if (!valid) return null
    const payloadStr = new TextDecoder().decode(b64UrlToBuf(data))
    const payload = JSON.parse(payloadStr)
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch (e) {
    console.error("Error al verificar sesión:", e)
    return null
  }
}

