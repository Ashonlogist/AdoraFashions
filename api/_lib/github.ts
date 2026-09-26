import { Octokit } from '@octokit/rest'
import type { ApiResponse } from './http'

export const SECTIONS = ['hero', 'about', 'collections', 'testimonials', 'contact', 'settings'] as const
export type Section = (typeof SECTIONS)[number]

const IMAGE_DIR = 'public/images'

export function repoConfig() {
  return {
    owner: process.env.GITHUB_OWNER ?? '',
    repo: process.env.GITHUB_REPO ?? '',
    branch: process.env.GITHUB_BRANCH ?? 'main',
  }
}

export function client(): Octokit {
  return new Octokit({ auth: process.env.GITHUB_TOKEN ?? '' })
}

export function isSection(value: unknown): value is Section {
  return typeof value === 'string' && (SECTIONS as readonly string[]).includes(value)
}

/** Slugs are generated, never typed by hand — this is the guard on that promise. */
export function isSlot(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80
}

export function contentPath(section: Section) {
  return `content/${section}.json`
}

export function imagePath(slot: string) {
  return `${IMAGE_DIR}/${slot}.png`
}

function decodeBase64(value: string): string {
  return Buffer.from(value, 'base64').toString('utf8')
}

/** Read a file from the default branch. Returns null when it does not exist yet. */
export async function readFile(
  octokit: Octokit,
  path: string,
): Promise<{ content: string; sha: string } | null> {
  const { owner, repo, branch } = repoConfig()
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref: branch })
    if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string') return null
    return { content: decodeBase64(data.content), sha: data.sha }
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null
    throw error
  }
}

/** Create or overwrite a file, always sending the previous blob's SHA when we have one. */
export async function writeFile(
  octokit: Octokit,
  path: string,
  contents: string,
  message: string,
  existingSha?: string,
) {
  const { owner, repo, branch } = repoConfig()
  const current = existingSha ?? (await readFile(octokit, path))?.sha
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message,
    content: Buffer.from(contents, 'utf8').toString('base64'),
    ...(current ? { sha: current } : {}),
  })
  return { path, branch, sha: current ?? null }
}

type FriendlyError = { status: number; message: string }

/** Turn a GitHub/network failure into something a non-technical owner can act on. */
export function friendlyError(error: unknown): FriendlyError {
  const status = (error as { status?: number }).status ?? 0
  const raw = (error as { message?: string }).message ?? 'Unexpected error'

  if (status === 401) {
    return {
      status: 401,
      message:
        'GitHub rejected the access token. Check that GITHUB_TOKEN is valid and has "contents: write" permission to this repository.',
    }
  }
  if (status === 403) {
    return {
      status: 403,
      message:
        'GitHub refused the request — the token is most likely missing write permission, or you have hit the API rate limit. Try again in a few minutes.',
    }
  }
  if (status === 404) {
    return {
      status: 404,
      message:
        'That file or repository path was not found. Check GITHUB_OWNER, GITHUB_REPO and GITHUB_BRANCH.',
    }
  }
  if (status === 409 || status === 422) {
    return {
      status: 409,
      message:
        'GitHub reported a conflict — someone else may have saved a change a moment ago. Reload the page and try again.',
    }
  }
  if (status === 413) {
    return {
      status: 413,
      message: 'That file is too large for GitHub. Please compress the image and try again.',
    }
  }
  return { status: status || 500, message: raw }
}

export function fail(res: ApiResponse, error: unknown) {
  const { status, message } = friendlyError(error)
  res.status(status).json({ error: message })
}
