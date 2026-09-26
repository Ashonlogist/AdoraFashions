import type { ApiRequest, ApiResponse } from '../_lib/http'
import { configurationError, methodNotAllowed, requireSession } from '../_lib/auth'
import { client, fail, imagePath, isSlot, readFile, repoConfig, writeFile } from '../_lib/github'
import { toWebp } from '../_lib/images'

/**
 * Backstop only. The request body is already capped well below this by the host
 * (Netlify 5.5 MB, Vercel 4.5 MB), and base64 inflates by 4/3, so a body that gets
 * this far can never hold 8 MB of image. Kept as a floor against a decode bomb.
 */
const MAX_BYTES = 8 * 1024 * 1024

/**
 * Commits an image to `/public/images/<slot>.webp`.
 *
 * The filename is always derived from the slot the admin UI generated, so the
 * owner never types one and can never accidentally create a path outside the
 * images directory. The returned path is what the admin writes into the
 * relevant content JSON in a follow-up save.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (!requireSession(req, res)) return

  const missing = configurationError()
  if (missing) return res.status(503).json({ error: missing })

  const body = (req.body ?? {}) as { slot?: unknown; base64?: unknown; mime?: unknown }
  const slot = typeof body.slot === 'string' ? body.slot.trim().toLowerCase() : ''
  if (!isSlot(slot)) {
    return res.status(400).json({ error: 'That image slot is not valid.' })
  }

  if (typeof body.base64 !== 'string' || body.base64.length === 0) {
    return res.status(400).json({ error: 'No image data was received.' })
  }

  // Tolerate a full data URL as well as a bare base64 payload.
  const base64 = body.base64.includes(',') ? body.base64.slice(body.base64.indexOf(',') + 1) : body.base64
  const incoming = Buffer.from(base64, 'base64')

  if (incoming.length === 0) {
    return res.status(400).json({ error: 'That image could not be read. Please try exporting it again.' })
  }
  if (incoming.length > MAX_BYTES) {
    return res.status(413).json({
      error: 'That image is larger than 8 MB. Please export a smaller PNG and try again.',
    })
  }

  let png: Buffer
  try {
    png = await toWebp(incoming, typeof body.mime === 'string' ? body.mime : undefined)
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }

  try {
    const octokit = client()
    const path = imagePath(slot)
    const existing = await readFile(octokit, path)
    const result = await writeFile(
      octokit,
      path,
      png.toString('base64'),
      existing
        ? `image: replace ${slot} via admin panel`
        : `image: add ${slot} via admin panel`,
      existing?.sha,
    )
    const { branch } = repoConfig()
    return res.status(200).json({
      ok: true,
      slot,
      path: result.path,
      publicPath: `/images/${slot}.webp`,
      bytes: png.length,
      branch,
    })
  } catch (error) {
    return fail(res, error)
  }
}
