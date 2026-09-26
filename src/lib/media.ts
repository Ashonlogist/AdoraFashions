/**
 * The content files call this field `image`, but a pasted link can point at a
 * video file, and the site will play it in place.
 *
 * Only a *direct* file URL can be used as a `<video src>`. Social URLs — an
 * Instagram reel, a YouTube or TikTok link — are pages, not media files: the
 * browser cannot stream them into a video element, and their embeds are
 * iframes the page does not control well enough to autoplay or to style. Those
 * are recognised separately so the dashboard can say so plainly instead of
 * rendering a broken image.
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.m4v', '.mov', '.ogv', '.ogg', '.mkv']

/** Hosts whose links are share pages rather than media files. */
const EMBED_HOSTS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'instagram.com',
  'facebook.com',
  'fb.watch',
  'tiktok.com',
  'twitter.com',
  'x.com',
]

/** Strips query string and hash, so `clip.mp4?token=x` is still recognised. */
function pathOf(src: string) {
  return src.split(/[?#]/)[0].toLowerCase()
}

function hostOf(src: string) {
  const match = src.match(/^https?:\/\/([^/:]+)/i)
  return match ? match[1].toLowerCase() : ''
}

/** True when the URL points at a video file the browser can play directly. */
export function isVideoUrl(src: string | undefined | null) {
  if (!src) return false
  return VIDEO_EXTENSIONS.some((extension) => pathOf(src).endsWith(extension))
}

/** True for a social share link, which needs an embed rather than a media file. */
export function isEmbedUrl(src: string | undefined | null) {
  if (!src) return false
  const host = hostOf(src)
  if (!host) return false
  return EMBED_HOSTS.some((known) => host === known || host.endsWith(`.${known}`))
}
