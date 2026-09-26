import { timingSafeEqual } from 'node:crypto'
import type { ApiRequest, ApiResponse } from './http'
import jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'adora_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export type SessionPayload = { sub: 'admin' }

function env(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

/**
 * Why signing in is impossible, or null. Deliberately excludes GitHub: if the
 * token is missing you still need to reach the dashboard to read the reason.
 */
export function authConfigurationError(): string | null {
  if (!env('ADMIN_PASSWORD')) return 'ADMIN_PASSWORD is not set on this deployment.'
  if (!env('SESSION_SECRET')) return 'SESSION_SECRET is not set on this deployment.'
  return null
}

/** Why content or image writes are impossible, or null. */
export function githubConfigurationError(): string | null {
  if (!env('GITHUB_TOKEN')) return 'GITHUB_TOKEN is not set on this deployment.'
  if (!env('GITHUB_OWNER')) return 'GITHUB_OWNER is not set on this deployment.'
  if (!env('GITHUB_REPO')) return 'GITHUB_REPO is not set on this deployment.'
  return null
}

/** Everything the admin API needs. */
export function configurationError(): string | null {
  return authConfigurationError() ?? githubConfigurationError()
}

export function signSession(): string {
  const secret = env('SESSION_SECRET')
  if (!secret) throw new Error('SESSION_SECRET missing')
  return jwt.sign({ sub: 'admin' } satisfies SessionPayload, secret, {
    expiresIn: MAX_AGE_SECONDS,
  })
}

function readCookie(req: ApiRequest, name: string): string | null {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

/** Constant-time password check so the endpoint cannot be probed by timing. */
export function passwordMatches(candidate: unknown): boolean {
  const expected = env('ADMIN_PASSWORD')
  if (typeof candidate !== 'string' || !expected) return false
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) {
    // Still burn a comparison so length is the only thing an attacker learns.
    timingSafeEqual(b, b)
    return false
  }
  return timingSafeEqual(a, b)
}

export function setSessionCookie(res: ApiResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}${secure}`,
  )
}

export function clearSessionCookie(res: ApiResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
  )
}

/** Returns true when the request carries a valid, unexpired session. */
export function hasValidSession(req: ApiRequest): boolean {
  const token = readCookie(req, COOKIE_NAME)
  const secret = env('SESSION_SECRET')
  if (!token || !secret) return false
  try {
    const payload = jwt.verify(token, secret) as SessionPayload
    return payload.sub === 'admin'
  } catch {
    return false
  }
}

/** Guard for every /api/admin route except login and the session probe. */
export function requireSession(req: ApiRequest, res: ApiResponse): boolean {
  if (hasValidSession(req)) return true
  res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
  return false
}

export function methodNotAllowed(res: ApiResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '))
  res.status(405).json({ error: `Method not allowed. Use ${allowed.join(' or ')}.` })
}
