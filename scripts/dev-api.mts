/**
 * The admin API, running on your machine.
 *
 * `npm run dev` starts Vite and this side by side. Without it the dashboard has
 * nothing to talk to: Vite serves the site and nothing else, so every `/api/*`
 * request 404s and the login screen just spins on "not correct".
 *
 * The handler is the same Netlify Function that runs in production, imported
 * directly, so what works here works there.
 */
import { createServer } from 'node:http'

import { default as handler } from '../netlify/functions/api.ts'

const PORT = Number(process.env.API_PORT ?? 8787)

/**
 * Load `.env.local` by hand. Node only auto-loads `.env` for `--env-file`, and
 * the dashboard needs ADMIN_PASSWORD, SESSION_SECRET and the GitHub settings to
 * be present before the first request arrives.
 */
const { existsSync, readFileSync } = await import('node:fs')
for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (!match) continue
    const value = match[2].replace(/^["']|["']$/g, '')
    // Real environment variables win, so a shell export beats the file.
    if (process.env[match[1]] === undefined) process.env[match[1]] = value
  }
}

const server = createServer(async (req, res) => {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const body = Buffer.concat(chunks)

  const request = new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers: Object.entries(req.headers).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, Array.isArray(value) ? value.join(', ') : String(value)]],
    ),
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  })

  try {
    const response = await handler(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error(error)
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'The local API threw an error. Check the terminal.' }))
  }
})

server.listen(PORT, () => {
  console.log(`  admin API on http://localhost:${PORT}`)
})
