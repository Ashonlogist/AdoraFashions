import type { ApiRequest, ApiResponse } from '../_lib/http'
import { configurationError, methodNotAllowed, requireSession } from '../_lib/auth'
import { client, fail, repoConfig } from '../_lib/github'

/** Lists what is already in `/public/images` so the owner can see their library. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
  if (!requireSession(req, res)) return

  const missing = configurationError()
  if (missing) return res.status(503).json({ error: missing })

  const { owner, repo, branch } = repoConfig()

  try {
    const octokit = client()
    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1',
    })
    const images = (data.tree ?? [])
      .filter((entry) => entry.type === 'blob' && entry.path?.startsWith('public/images/'))
      .map((entry) => ({
        slot: entry.path!.replace('public/images/', '').replace(/\.png$/i, ''),
        file: entry.path!.split('/').pop()!,
        path: `/${entry.path!.replace('public/', '')}`,
        size: entry.size ?? 0,
      }))
      .sort((a, b) => a.slot.localeCompare(b.slot))

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ branch, images })
  } catch (error) {
    return fail(res, error)
  }
}
