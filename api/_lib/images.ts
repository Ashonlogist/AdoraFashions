/** Transparent cutouts must stay PNG, so PNG passes through byte-identical. */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const ACCEPTED: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
}

export function detectFormat(buffer: Buffer): 'png' | 'jpg' | 'webp' | 'unknown' {
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(PNG_MAGIC)) return 'png'
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
  if (
    buffer.length > 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'webp'
  return 'unknown'
}

/**
 * Everything is stored as `<slot>.png`. PNG is passed straight through; anything
 * else is re-encoded so the file always matches its extension (and keeps an alpha
 * channel if the source had one).
 */
export async function toPng(buffer: Buffer, declaredMime?: string): Promise<Buffer> {
  const format = detectFormat(buffer)
  if (format === 'png') return buffer

  const mime = declaredMime?.toLowerCase().split(';')[0].trim()
  const accepted = mime ? ACCEPTED[mime] : undefined
  if (!accepted) {
    throw new Error(
      'Unsupported image format. Please upload a PNG (or JPEG/WebP, which we convert automatically).',
    )
  }
  if (format === 'unknown') {
    throw new Error('That file does not look like a valid image. Please try exporting it again.')
  }

  try {
    const { default: sharp } = await import('sharp')
    return await sharp(buffer).png({ compressionLevel: 9 }).toBuffer()
  } catch {
    throw new Error(
      'This deployment cannot convert that image format. Please export it as a PNG and upload again.',
    )
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

/** Mirrors the slot convention the admin UI shows the owner. */
export function collectionSlot(category: string, items: { category: string; id: string }[]) {
  const slug = slugify(category) || 'piece'
  const used = items.filter((item) => item.category === category).length
  let index = used + 1
  const taken = new Set(items.map((item) => item.id))
  while (taken.has(`${slug}-${index}`)) index += 1
  return { slot: `collection-${slug}-${String(index).padStart(2, '0')}`, index }
}
