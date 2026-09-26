import { useEffect, useRef, useState } from 'react'
import { isVideoUrl } from '../lib/media'
import { useMotionPreference } from '../lib/useMotionPreference'

/**
 * Renders a content field that may hold either a photograph or a video file.
 *
 * Autoplay only works when the element is muted and inline, so both are always
 * set — an unmuted autoplaying video is refused by every browser. A visitor who
 * asks for reduced motion gets the video paused with controls instead, which is
 * the same rule the rest of the site follows: no motion nobody asked for.
 */
export function Media({
  src,
  alt,
  className,
  imgClassName,
  controls = false,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  /** Show playback controls. Used in the lightbox, where a click is deliberate. */
  controls?: boolean
  priority?: boolean
}) {
  const { reduced } = useMotionPreference()
  const video = useRef<HTMLVideoElement>(null)
  const isVideo = isVideoUrl(src)
  const autoplay = isVideo && !reduced && !controls
  /* Autoplay can still be refused for reasons we cannot see from here — a
     low-power mode, a browser policy change. Rather than leave a silent, frozen
     first frame, the element grows controls so it can still be watched. */
  const [refused, setRefused] = useState(false)
  const showControls = controls || (isVideo && reduced) || refused

  // A video swapped in while the page is open still has to obey the preference,
  // and a paused-then-reduced video should stop rather than carry on.
  useEffect(() => {
    const element = video.current
    if (!element || !isVideo) return
    setRefused(false)
    if (autoplay) {
      void element.play().catch(() => setRefused(true))
    } else {
      element.pause()
    }
  }, [autoplay, isVideo, src])

  if (!isVideo) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    )
  }

  return (
    <video
      ref={video}
      src={src}
      aria-label={alt}
      className={className ?? imgClassName}
      autoPlay={autoplay}
      muted
      loop={!showControls}
      playsInline
      controls={showControls || undefined}
      preload={priority ? 'auto' : 'metadata'}
    />
  )
}
