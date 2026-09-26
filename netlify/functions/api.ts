import session from '../../api/admin/session'
import login from '../../api/admin/login'
import logout from '../../api/admin/logout'
import content from '../../api/admin/content/index'
import contentSection from '../../api/admin/content/[section]'
import images from '../../api/admin/images'
import image from '../../api/admin/image'
import type { ApiRequest, ApiResponse } from '../../api/_lib/http'

/**
 * The whole admin API as one Netlify Function.
 *
 * `config.path` maps every `/api/*` request here, so the dashboard keeps talking
 * to the same URLs it always has and nothing in `src/` has to change. Netlify
 * matches the function before it looks at static files and rewrites, which is
 * what stops `/api/admin/session` from 404ing into `index.html`.
 *
 * The handlers in `api/` are written against the Node request/response pair Vercel
 * hands a function, and they stay the single source of truth. This file is only a
 * translation layer: it rebuilds the handful of Node fields the handlers touch
 * (`method`, `headers`, `query`, `body`, `socket`) and collects what they write.
 */
export const config = { path: '/api/*' }

type Handler = (req: ApiRequest, res: ApiResponse) => unknown

/**
 * Netlify rejects request bodies over 6 MB, and the dashboard posts images as
 * base64 inside JSON (about 4/3 the size of the file). Failing here with an
 * explanation beats the platform's bare 413.
 */
const MAX_BODY_BYTES = Math.floor(5.5 * 1024 * 1024)

/** Collects what a handler writes instead of streaming it to a socket. */
class CollectedResponse {
  statusCode = 200
  readonly headers = new Headers()
  private payload: string | undefined
  private ended = false

  status(code: number) {
    this.statusCode = code
    return this
  }

  setHeader(name: string, value: string | number | readonly string[]) {
    // Append rather than set: repeated Set-Cookie headers must not overwrite
    // each other.
    if (name.toLowerCase() === 'set-cookie') {
      for (const item of Array.isArray(value) ? value : [value]) {
        this.headers.append(name, String(item))
      }
      return this
    }
    this.headers.set(name, Array.isArray(value) ? value.join(', ') : String(value))
    return this
  }

  json(body: unknown) {
    this.headers.set('Content-Type', 'application/json; charset=utf-8')
    return this.end(JSON.stringify(body))
  }

  send(body?: unknown) {
    if (body === undefined) return this.end()
    if (typeof body === 'string') return this.end(body)
    return this.json(body)
  }

  end(body?: string) {
    if (!this.ended) {
      this.payload = body ?? this.payload
      this.ended = true
    }
    return this
  }

  toResponse(): Response {
    const empty = this.statusCode === 204 || this.statusCode === 304
    return new Response(empty ? null : (this.payload ?? null), {
      status: this.statusCode,
      headers: this.headers,
    })
  }
}

function query(url: URL): Record<string, string | string[] | undefined> {
  const entries: [string, string | string[]][] = []
  url.searchParams.forEach((value, key) => {
    const seen = entries.find(([name]) => name === key)
    if (seen) seen[1] = [...(seen[1] as string[]), value]
    else entries.push([key, value])
  })
  return Object.fromEntries(entries)
}

async function toRequest(
  request: Request,
  ip: string | undefined,
  extraQuery: Record<string, string> = {},
): Promise<ApiRequest> {
  const url = new URL(request.url)
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  let body: unknown
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text()
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = text
      }
    }
  }

  // The handlers only ever read these Node fields; `socket` backs the login
  // throttle, which has no equivalent on the Request API.
  return {
    method: request.method,
    headers,
    // `extraQuery` carries values the handler expects as a path parameter.
    query: { ...query(url), ...extraQuery },
    body,
    socket: { remoteAddress: ip },
  } as unknown as ApiRequest
}

function tooLarge(): Response {
  return new Response(
    JSON.stringify({
      error:
        'That image is too large to upload. Please pick a smaller file — around 2 MB works best.',
    }),
    { status: 413, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '') || '/'

  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_BODY_BYTES) return tooLarge()

  const res = new CollectedResponse()

  let route: Handler | undefined
  let params: Record<string, string> = {}
  if (path === '/api/admin/session') route = session
  else if (path === '/api/admin/login') route = login
  else if (path === '/api/admin/logout') route = logout
  else if (path === '/api/admin/content') route = content
  else if (path === '/api/admin/images') route = images
  else if (path === '/api/admin/image') route = image
  else if (path.startsWith('/api/admin/content/')) {
    // Vercel hands the `[section]` file its slug as a query parameter, so the
    // path segment has to be passed along the same way. The handler still owns
    // the allowlist and rejects anything unrecognised.
    params = { section: decodeURIComponent(path.slice('/api/admin/content/'.length)) }
    route = contentSection
  }

  if (!route) {
    return new Response(JSON.stringify({ error: 'Unknown endpoint.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const req = await toRequest(
    request,
    request.headers.get('x-nf-client-connection-ip') ?? undefined,
    params,
  )
  await route(req, res as unknown as ApiResponse)
  return res.toResponse()
}
