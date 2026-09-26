import type { ApiRequest, ApiResponse } from '../_lib/http'
import {
  authConfigurationError,
  methodNotAllowed,
  passwordMatches,
  setSessionCookie,
  signSession,
} from '../_lib/auth'

/** Small brute-force brake: repeated failures from one IP get a cool-off. */
const attempts = new Map<string, { count: number; until: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

function throttle(ip: string): number {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record || record.until < now) return 0
  // Only lock out once the allowance is actually spent. Without this check a
  // single mistyped password would lock the owner out for the whole window.
  if (record.count < MAX_ATTEMPTS) return 0
  return Math.ceil((record.until - now) / 1000)
}

function recordFailure(ip: string) {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record || record.until < now) {
    attempts.set(ip, { count: 1, until: now + WINDOW_MS })
    return
  }
  record.count += 1
  if (record.count >= MAX_ATTEMPTS) {
    // Push the cool-off out so the window restarts on the next failure.
    record.until = now + WINDOW_MS
  }
}

function clientIp(req: ApiRequest) {
  const forwarded = req.headers['x-forwarded-for']
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return (value?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown').trim()
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const missing = authConfigurationError()
  if (missing) return res.status(503).json({ error: missing })

  const ip = clientIp(req)
  const wait = throttle(ip)
  if (wait > 0) {
    return res
      .status(429)
      .json({ error: `Too many attempts. Please try again in ${wait} seconds.` })
  }

  const body = (req.body ?? {}) as { password?: unknown }
  if (!passwordMatches(body.password)) {
    recordFailure(ip)
    return res.status(401).json({ error: 'That password is not correct.' })
  }

  attempts.delete(ip)
  setSessionCookie(res, signSession())
  return res.status(200).json({ ok: true })
}
