export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    credentials: 'same-origin',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : {}

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Request failed (${response.status}).`
    throw new Error(message)
  }
  return data as T
}

function readAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('That file could not be read from your computer.'))
    reader.readAsDataURL(file)
  })
}

/** Longest edge we keep. Anything larger is wasted bytes on a phone. */
const MAX_EDGE = 2000

/**
 * Ceiling on the base64 we actually put on the wire, not on the decoded image.
 * Base64 inflates by 4/3, and the Netlify adapter refuses a body over 5.5 MB, so
 * this is the limit that matters — 4.6 MB encoded is ~3.4 MB of image and leaves
 * the JSON envelope room to spare.
 */
const MAX_ENCODED = Math.floor(4.6 * 1024 * 1024)

/**
 * Shrink in the browser before uploading.
 *
 * The dashboard posts base64 inside JSON, and Netlify rejects request bodies
 * over 6 MB, so a large original fails on the way in. WebP keeps the alpha
 * channel, so a transparent cutout still arrives with its background removed.
 */
async function prepareImage(file: File): Promise<{ blob: Blob; mime: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot process images.')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  // PNG is the fallback because it always works, including with transparency.
  for (const [mime, quality] of [
    ['image/webp', 0.82],
    ['image/png', undefined],
  ] as const) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, quality),
    )
    // toBlob quietly returns PNG when the requested format is unsupported, so a
    // webp request only counts if webp is what came back.
    if (blob && (mime === 'image/png' || blob.type === 'image/webp')) return { blob, mime }
  }
  throw new Error('That image could not be processed.')
}

export const adminApi = {
  session: () =>
    request<{
      authenticated: boolean
      configured: boolean
      writable: boolean
      message: string | null
    }>('/api/admin/session'),

  login: (password: string) => request<{ ok: true }>('/api/admin/login', { method: 'POST', body: { password } }),

  logout: () => request<{ ok: true }>('/api/admin/logout', { method: 'POST' }),

  content: () => request<{ branch: string; content: Record<string, unknown> }>('/api/admin/content'),

  save: (section: string, content: unknown) =>
    request<{ ok: true; path: string; branch: string; message: string }>(
      `/api/admin/content/${section}`,
      { method: 'PUT', body: { content } },
    ),

  images: () =>
    request<{ branch: string; images: { slot: string; file: string; path: string; size: number }[] }>(
      '/api/admin/images',
    ),

  async upload(slot: string, file: File) {
    const { blob, mime } = await prepareImage(file)
    const base64 = await readAsBase64(blob)
    if (base64.length > MAX_ENCODED) {
      throw new Error('That photo is still too large. Please try a smaller image.')
    }
    return request<{ ok: true; publicPath: string; path: string; bytes: number; branch: string }>(
      '/api/admin/image',
      { method: 'POST', body: { slot, base64, mime } },
    )
  },
}

export function formatBytes(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
