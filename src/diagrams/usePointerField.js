import { useCallback, useRef } from 'react'

/**
 * Where the pointer is over an element, as two numbers in [-1, 1].
 *
 * The three figures already answer a pointer by READING: hovering a deck loads
 * its rail, hovering a site lights what it published, hovering a district hands
 * over its sentence. That is the right response for a mechanism, and it is not
 * the only thing a pointer can be for. This is the other one - the pointer as a
 * point of view, so that moving it moves what a reader is looking at rather
 * than only what the drawing is saying.
 *
 * It writes `--px` and `--py` as custom properties instead of returning state,
 * for the same reason `useScrollSpread` does: a value that changes on every
 * pointer frame must not re-render a component tree with forty solids in it.
 * The stylesheet reads the two numbers and composes them into transforms that
 * already exist, so the whole effect runs on the compositor and nothing in
 * React ever hears about it.
 *
 * IT IS OFF WHERE IT WOULD BE A LIE. On a touch screen there is no pointer to
 * follow - a tap would jump the layers and leave them wherever the finger last
 * was - so a coarse pointer never arms it. Reduced motion never arms it either.
 * In both cases the element keeps the zeroes it started with and every
 * expression downstream of them collapses to no offset at all.
 */
export function usePointerField({ reduced = false } = {}) {
  const frame = useRef(0)

  return useCallback((node) => {
    if (!node || reduced) return undefined
    if (typeof window === 'undefined') return undefined
    // A pointer that cannot hover cannot drive a parallax; it can only teleport
    // one. `any-hover` rather than `hover`, so a laptop with a touchscreen
    // still gets it.
    if (!window.matchMedia('(any-hover: hover) and (pointer: fine)').matches) return undefined

    const write = (x, y) => {
      node.style.setProperty('--px', x.toFixed(3))
      node.style.setProperty('--py', y.toFixed(3))
    }

    const move = (event) => {
      if (frame.current) return
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0
        const box = node.getBoundingClientRect()
        if (!box.width || !box.height) return
        const x = ((event.clientX - box.left) / box.width) * 2 - 1
        const y = ((event.clientY - box.top) / box.height) * 2 - 1
        write(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
      })
    }

    const leave = () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      write(0, 0)
    }

    write(0, 0)
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', leave)

    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', leave)
    }
  }, [reduced])
}
