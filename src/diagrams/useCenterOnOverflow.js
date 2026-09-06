import { useCallback } from 'react'

/**
 * A schematic does not simplify well, so on a narrow screen it holds its scale
 * and pans inside its own frame. Open it on the middle of the sheet rather than
 * the left margin, so the boundary - the part that carries the claim - is what
 * a reader sees first.
 *
 * Returns a callback ref: the frame centres itself the moment it attaches, and
 * again whenever it is resized. Centring is coalesced onto one animation frame
 * so a burst of ResizeObserver callbacks - font load, container query, the
 * figure booting its own width - cannot fight the scroll position and jitter
 * the sheet under the reader's eye.
 */
export function useCenterOnOverflow() {
  return useCallback((frame) => {
    if (!frame) return undefined
    let pending = 0
    const centre = () => {
      if (pending) return
      pending = window.requestAnimationFrame(() => {
        pending = 0
        const slack = frame.scrollWidth - frame.clientWidth
        if (slack > 0) frame.scrollTo({ left: slack / 2 })
      })
    }
    centre()
    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(pending)
        pending = 0
      }
    }
    const observer = new ResizeObserver(centre)
    observer.observe(frame)
    return () => {
      window.cancelAnimationFrame(pending)
      pending = 0
      observer.disconnect()
    }
  }, [])
}
