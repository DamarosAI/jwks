import { useCallback, useEffect, useRef, useState } from 'react'

export const AUTOPLAY_RESUME_MS = 12000
export const HERO_STAGE_MS = 12000
export const HERO_TICK_MS = 2600
export const LIVE_STAGE_MS = 9000
export const LIVE_TICK_MS = 2100
export const AGENT_TICK_MS = 1800
export const AGENT_ROTATE_TICKS = 6
export const SCROLL_IDLE_MS = 640
export const NARROW_VIEWPORT = '(max-width: 640px)'

export function isAutoplayToggle(target) {
  return Boolean(target?.closest?.('[data-autoplay-toggle]'))
}

export function autoplayIndex(tick, length, fallback = 0) {
  if (!Number.isFinite(tick) || length <= 0) return fallback
  return ((tick % length) + length) % length
}

export function shouldPlayAutoplay({
  reduced = false,
  held = false,
  inView = true,
  scrollIdle = true,
  visible = true,
  narrow = false,
} = {}) {
  return !reduced && !held && inView && scrollIdle && visible && !narrow
}

export function shouldRunAmbient({ reduced = false, inView = true, narrow = false } = {}) {
  return !reduced && inView && !narrow
}

export function shouldKeepPreviousStage(mode, previous) {
  return mode === 'auto' && previous !== null
}

export function scrollingDocumentClass(idle) {
  return idle ? '' : 'is-scrolling'
}

export function applyScrollingDocumentClass(idle, root = globalThis.document?.documentElement) {
  const next = scrollingDocumentClass(idle)
  root?.classList.toggle('is-scrolling', Boolean(next))
  return next
}

let scrollIdle = true
const scrollIdleListeners = new Set()
let scrollIdleTimer = 0
let scrollIdleFrame = 0
let scrollIdleBound = false

function publishScrollIdle(next) {
  if (scrollIdle === next) return
  scrollIdle = next
  applyScrollingDocumentClass(next)
  scrollIdleListeners.forEach((listener) => listener(next))
}

function onWindowScroll() {
  if (scrollIdleFrame) return
  scrollIdleFrame = window.requestAnimationFrame(() => {
    scrollIdleFrame = 0
    publishScrollIdle(false)
    window.clearTimeout(scrollIdleTimer)
    scrollIdleTimer = window.setTimeout(() => publishScrollIdle(true), SCROLL_IDLE_MS)
  })
}

function bindScrollIdle() {
  if (scrollIdleBound || typeof window === 'undefined') return
  scrollIdleBound = true
  window.addEventListener('scroll', onWindowScroll, { passive: true })
}

function unbindScrollIdle() {
  if (!scrollIdleBound || scrollIdleListeners.size) return
  scrollIdleBound = false
  window.removeEventListener('scroll', onWindowScroll)
  window.cancelAnimationFrame(scrollIdleFrame)
  window.clearTimeout(scrollIdleTimer)
  scrollIdleFrame = 0
  publishScrollIdle(true)
}

let documentVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden'
const visibilityListeners = new Set()
let visibilityBound = false

function publishVisible(next) {
  if (documentVisible === next) return
  documentVisible = next
  document.documentElement.classList.toggle('is-hidden', !next)
  visibilityListeners.forEach((listener) => listener(next))
}

function onVisibility() {
  publishVisible(document.visibilityState !== 'hidden')
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => Boolean(globalThis.matchMedia?.(query)?.matches))

  useEffect(() => {
    const media = globalThis.matchMedia?.(query)
    if (!media) return undefined
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

export function useDocumentVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden')

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    visibilityListeners.add(setVisible)
    setVisible(documentVisible)
    if (!visibilityBound) {
      visibilityBound = true
      document.addEventListener('visibilitychange', onVisibility)
      onVisibility()
    }
    return () => visibilityListeners.delete(setVisible)
  }, [])

  return visible
}

export function useInView(ref, { threshold = 0.18 } = {}) {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref?.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    }, { threshold: [0, threshold, 0.45], rootMargin: '48px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}

export function useScrollIdle(ms = SCROLL_IDLE_MS) {
  const [idle, setIdle] = useState(true)

  useEffect(() => {
    scrollIdleListeners.add(setIdle)
    setIdle(scrollIdle)
    bindScrollIdle()
    return () => {
      scrollIdleListeners.delete(setIdle)
      unbindScrollIdle()
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
