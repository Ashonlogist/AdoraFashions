import { useEffect, useState } from 'react'
import { prefersReducedMotion } from './motion'

/**
 * Single source of truth for motion suppression. Every bespoke animation in the
 * site reads this so a `prefers-reduced-motion` visitor gets a still, fully
 * designed frame rather than a stripped-back one.
 */
export function useMotionPreference() {
  const [reduced, setReduced] = useState(() => prefersReducedMotion())

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return { reduced }
}
