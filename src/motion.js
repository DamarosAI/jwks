import { useEffect, useRef } from 'react'

/** Inner pane copy only. Chrome stays put. Opacity only. Travel shears Endless. */
export const PANE_SETTLE_CLASS = 'pane-settle'
export const PANE_SETTLE_MS = 180

export function prefersReducedMotion(media = globalThis.matchMedia) {
  return Boolean(media?.('(prefers-reduced-motion: reduce)')?.matches)
}

export function paneSettleClass(armed, reduced) {
  if (reduced || !armed) return PANE_SETTLE_CLASS
  return `${PANE_SETTLE_CLASS} is-settling`
}

/** Prefer the visual viewport so mobile chrome does not shear section hops. */
export function viewportHeight(view = globalThis) {
  return Math.round(view.visualViewport?.height ?? view.innerHeight ?? 0)
}

/** Center a section in the usable viewport. Tall sections keep their opening in frame. */
export function sectionScrollTarget({
  sectionTop,
  sectionHeight,
  viewportHeight,
  documentHeight,
  insetTop = 0,
  insetBottom = 0,
}) {
  const top = Math.max(0, insetTop)
  const bottom = Math.max(0, insetBottom)
  const usable = Math.max(1, viewportHeight - top - bottom)
  const pictured = Math.min(Math.max(0, sectionHeight), usable)
  const ideal = sectionTop + (pictured / 2) - (top + usable / 2)
  const maxScroll = Math.max(0, documentHeight - viewportHeight)
  return Math.round(Math.min(maxScroll, Math.max(0, ideal)))
}

export function sectionScrollDuration(distance, viewportHeight) {
  const travel = Math.abs(distance)
  const view = Math.max(1, viewportHeight)
  return Math.round(Math.min(480, Math.max(300, 260 + (travel / view) * 160)))
}

export function easeSectionScroll(progress) {
  const t = Math.min(1, Math.max(0, progress))
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
}

/**
 * First paint stays still so section GSAP owns enter.
 * Selection updates in place. Travel is opt-in via paneSettleClass.
 */
export function usePaneSettle() {
  const armed = useRef(false)
  useEffect(() => {
    armed.current = true
  }, [])
  return paneSettleClass(false, prefersReducedMotion() || !armed.current)
}
