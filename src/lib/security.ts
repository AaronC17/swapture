/**
 * Security utilities — input sanitization, rate limiting, validation
 */

// ─── INPUT SANITIZATION ───────────────────────────
/** Strip HTML tags to prevent XSS in stored data */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

/** Sanitize and limit string length */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input).slice(0, maxLength).trim()
}

/** Sanitize email — lowercase, trim, validate format */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  const email = input.toLowerCase().trim().slice(0, 254) // RFC max
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

/** Sanitize phone — keep only digits, +, - */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20)
}

/** Safe number extraction */
export function sanitizeNumber(input: unknown, min = 0, max = 999999): number {
  const n = Number(input)
  if (isNaN(n) || !isFinite(n)) return 0
  return Math.min(max, Math.max(min, Math.round(n)))
}

// ─── RATE LIMITING ────────────────────────────────
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup stale entries periodically (every 5 min)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * In-memory rate limiter. Returns { allowed, remaining, resetIn }
 * @param identifier — IP or user ID
 * @param maxRequests — max requests per window
 * @param windowMs — time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  entry.count++
  const remaining = Math.max(0, maxRequests - entry.count)
  const resetIn = entry.resetAt - now

  return { allowed: entry.count <= maxRequests, remaining, resetIn }
}

/** Get client IP from request */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return '127.0.0.1'
}

// ─── SAFE JSON PARSE ──────────────────────────────
/** Safely parse JSON from request body, returns null on failure */
export async function safeJsonParse(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
    return body as Record<string, unknown>
  } catch {
    return null
  }
}

// ─── RATE LIMIT PRESETS ───────────────────────────
/** 5 login attempts per 15 minutes per IP */
export const LOGIN_LIMIT = { max: 5, window: 15 * 60 * 1000 }
/** 10 contact form submissions per 15 minutes per IP */
export const CONTACT_LIMIT = { max: 10, window: 15 * 60 * 1000 }
/** 20 lead/order submissions per 15 minutes per IP */
export const LEAD_LIMIT = { max: 20, window: 15 * 60 * 1000 }
/** 30 chat messages per 5 minutes per IP */
export const CHAT_LIMIT = { max: 30, window: 5 * 60 * 1000 }
