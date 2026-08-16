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
