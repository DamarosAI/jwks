import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * Pointer lighting for a schematic without re-rendering the drawing.
 *
 * Hover used to call `setHot` in the same component that owns every solid,
 * every trace and every ambient clock. That re-rendered the whole SVG on
 * every enter and leave - hundreds of nodes, mid-animation - which is the
 * hitch a reader feels as jitter the instant the cursor arrives.
 *
 * Lighting is a class written onto `[data-lit]` marks directly. The caller
 * receives a `probe(key)` binder and forwards the active key to a tiny
 * readout via `onHot`, so the mesh never puts the pointer in React state.
 *
 * React owns `className` on those marks and will wipe an imperative `is-hot`
 * the next time a phase rewrite commits. The layout effect below re-stamps
 * whatever key is still active after every commit of the drawing, before
 * paint, so a hover survives the run advancing underneath it.
 */
export function useDiagramHot(svgRef, onHot) {
  const lit = useRef(null)
  const onHotRef = useRef(onHot)
  onHotRef.current = onHot

  const paint = useCallback((key) => {
    const root = svgRef.current
    if (!root) return
    const prev = lit.current
    if (prev === key) return
    if (prev != null) {
      root.querySelectorAll(`[data-lit="${CSS.escape(prev)}"]`).forEach((node) => {
        node.classList.remove('is-hot')
      })
    }
    if (key != null) {
      root.querySelectorAll(`[data-lit="${CSS.escape(key)}"]`).forEach((node) => {
        node.classList.add('is-hot')
      })
    }
    lit.current = key
    onHotRef.current?.(key)
  }, [svgRef])

  useLayoutEffect(() => {
    const key = lit.current
    const root = svgRef.current
    if (!root || key == null) return undefined
    root.querySelectorAll(`[data-lit="${CSS.escape(key)}"]`).forEach((node) => {
      node.classList.add('is-hot')
    })
    return undefined
  })

  return useCallback((key) => ({
    onMouseEnter: () => paint(key),
    onMouseLeave: () => paint(null),
  }), [paint])
}
