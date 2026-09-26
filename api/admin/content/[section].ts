import type { ApiRequest, ApiResponse } from '../../_lib/http'
import { configurationError, methodNotAllowed, requireSession } from '../../_lib/auth'
import {
  client,
  contentPath,
  fail,
  isSection,
  type Section,
  readFile,
  repoConfig,
  writeFile,
} from '../../_lib/github'

type Params = { section?: string }

function sectionOf(req: ApiRequest): Section | null {
  const params = req.query as Params
  const raw = Array.isArray(params.section) ? params.section[0] : params.section
  return isSection(raw) ? (raw as Section) : null
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireSession(req, res)) return

  const section = sectionOf(req)
  if (!section) {
    return res.status(400).json({ error: 'Unknown content section.' })
  }

  const missing = configurationError()
  if (missing) return res.status(503).json({ error: missing })

  try {
    const octokit = client()
    const path = contentPath(section)

    if (req.method === 'GET') {
      const file = await readFile(octokit, path)
      res.setHeader('Cache-Control', 'no-store')
      if (!file) return res.status(404).json({ error: `content/${section}.json was not found.` })
      return res.status(200).json({ section, sha: file.sha, content: JSON.parse(file.content) })
    }

    if (req.method === 'PUT') {
      const body = (req.body ?? {}) as { content?: unknown; message?: unknown }
      if (!body.content || typeof body.content !== 'object') {
        return res.status(400).json({ error: 'No content was supplied.' })
      }

      const serialised = `${JSON.stringify(body.content, null, 2)}\n`
      if (serialised.length > 400_000) {
        return res.status(413).json({ error: 'That section is too large to save as a single file.' })
      }

      const message =
        typeof body.message === 'string' && body.message.trim().length > 0
          ? body.message.trim().slice(0, 120)
          : `content: update ${section} via admin panel`

      const result = await writeFile(octokit, path, serialised, message)
      const { branch } = repoConfig()
      return res.status(200).json({
        ok: true,
        section,
        path: result.path,
        branch,
        message,
      })
    }

    return methodNotAllowed(res, ['GET', 'PUT'])
  } catch (error) {
    return fail(res, error)
  }
}
