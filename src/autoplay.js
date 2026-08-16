import { useCallback, useEffect, useRef, useState } from 'react'

export const AUTOPLAY_RESUME_MS = 12000
export const HERO_STAGE_MS = 12000
export const HERO_TICK_MS = 2600
export const LIVE_STAGE_MS = 9000
export const LIVE_TICK_MS = 2100
export const AGENT_TICK_MS = 1800
export const AGENT_ROTATE_TICKS = 6
export const SCROLL_IDLE_MS = 640

export function isAutoplayToggle(target) {
  return Boolean(target?.closest?.('[data-autoplay-toggle]'))
}

export function autoplayIndex(tick, length, fallback = 0) {
  if (!Number.isFinite(tick) || length <= 0) return fallback
  return ((tick % length) + length) % length
}

export function shouldPlayAutoplay({ reduced = false, held = false, inView = true, scrollIdle = true } = {}) {
  return !reduced && !held && inView && scrollIdle
}

export function shouldKeepPreviousStage(mode, previous) {
  return mode === 'auto' && previous !== null
}

export function useInView(ref, { threshold = 0.18 } = {}) {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const node = ref?.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    }, { threshold: [0, threshold, 0.45] })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}

export function useScrollIdle(ms = SCROLL_IDLE_MS) {
  const [idle, setIdle] = useState(true)

  useEffect(() => {
    let timer = 0
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setIdle(false)
        window.clearTimeout(timer)
        timer = window.setTimeout(() => setIdle(true), ms)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [ms])

  return idle
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
