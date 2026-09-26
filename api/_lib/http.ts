import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * The shape Vercel hands a Node.js function: the standard Node request/response
 * with the platform's `query`, `body`, `status()` and `json()` additions.
 * Declared locally so the server code stays dependency-free.
 */
export type ApiRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>
  body: unknown
}

export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse
  json(body: unknown): ApiResponse
  send(body?: unknown): ApiResponse
  redirect(url: string): ApiResponse
}
