import type { ApiRequest, ApiResponse } from '../_lib/http'
import { configurationError, methodNotAllowed, requireSession } from '../_lib/auth'
import { client, fail, repoConfig } from '../_lib/github'

/** Anything the browser can render, and nothing else. */
const IMAGE_FILE = /\.(png|jpe?g|webp|avif|gif)$/i

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
      // Credits and stray notes live in here too; they are not replaceable art.
      .map((entry) => entry.path!.replace('public/images/', ''))
      .filter((file) => IMAGE_FILE.test(file))
      .map((file) => ({
        // The slot is the filename without its extension, so the dashboard can
        // match an image to a field whether it is stored as .webp or .png.
        slot: file.replace(IMAGE_FILE, ''),
        file,
        path: `/images/${file}`,
        size: 0,
      }))
      .sort((a, b) => a.slot.localeCompare(b.slot))

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ branch, images })
  } catch (error) {
    return fail(res, error)
  }
}
