import { headers } from "next/headers"

type RateLimitRecord = {
  count: number
  expiresAt: number
}

const store = new Map<string, RateLimitRecord>()

export async function rateLimitByKey(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const record = store.get(key)

  // Basic cleanup to avoid memory leaks
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      if (v.expiresAt < now) {
        store.delete(k)
      }
    }
  }

  if (record && record.expiresAt > now) {
    if (record.count >= limit) {
      return false
    }
    record.count += 1
    return true
  }

  store.set(key, {
    count: 1,
    expiresAt: now + windowMs,
  })

  return true
}

export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  return headersList.get("x-real-ip") || "unknown"
}
