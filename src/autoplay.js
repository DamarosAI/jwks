import { useCallback, useEffect, useRef, useState } from 'react'

export const AUTOPLAY_RESUME_MS = 9000

export function isAutoplayToggle(target) {
  return Boolean(target?.closest?.('[data-autoplay-toggle]'))
}

export function useAutoplayHold(reduced) {
  const [held, setHeld] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hold = useCallback(() => {
    if (reduced) return
    setHeld(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHeld(false), AUTOPLAY_RESUME_MS)
  }, [reduced])

  const clearHold = useCallback(() => {
    window.clearTimeout(timer.current)
    setHeld(false)
  }, [])

  return { held, hold, clearHold }
}
