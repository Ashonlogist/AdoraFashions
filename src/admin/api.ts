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

function readAsBase64(file: File): Promise<string> {
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
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('That image is larger than 8 MB. Please export a smaller PNG.')
    }
    const base64 = await readAsBase64(file)
    return request<{ ok: true; publicPath: string; path: string; bytes: number; branch: string }>(
      '/api/admin/image',
      { method: 'POST', body: { slot, base64, mime: file.type || 'image/png' } },
    )
  },
}

export function formatBytes(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
