import type { ApiRequest, ApiResponse } from '../../_lib/http'
import { configurationError, methodNotAllowed, requireSession } from '../../_lib/auth'
import { client, contentPath, fail, readFile, repoConfig, SECTIONS } from '../../_lib/github'

/**
 * Every section at once, straight from GitHub rather than the deployed bundle —
 * the dashboard must always show what is actually on `main`, even if the last
 * commit has not finished deploying.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
  if (!requireSession(req, res)) return

  const missing = configurationError()
  if (missing) return res.status(503).json({ error: missing })

  try {
    const octokit = client()
    const entries = await Promise.all(
      SECTIONS.map(async (section) => {
        const file = await readFile(octokit, contentPath(section))
        if (!file) return [section, null] as const
        try {
          return [section, JSON.parse(file.content)] as const
        } catch {
          return [section, null] as const
        }
      }),
    )
    const { branch } = repoConfig()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ branch, content: Object.fromEntries(entries) })
  } catch (error) {
    return fail(res, error)
  }
}
