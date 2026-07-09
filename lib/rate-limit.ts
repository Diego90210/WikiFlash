// ponytail: in-memory rate limiter, good enough for single-instance serverless.
// Upgrade to Upstash Redis if you need distributed/rmulti-region rate limiting.

const hits = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of hits) {
    if (val.resetAt <= now) hits.delete(key)
  }
}, 5 * 60 * 1000)

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
