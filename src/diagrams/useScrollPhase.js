import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * The reader advances the run.
 *
 * Phase index comes from how far the section has travelled through the
 * viewport, not from a wall clock, so scrolling the page is what moves the
 * console from proposal to receipt. Nothing loops at the reader, and the
 * console holds wherever they stop. Each phase carries a `span` weight, so the
 * beat that matters - the checkpoint hold, the refusal at the boundary - owns
 * the widest stretch of scroll and is what a reader parked mid-section sees.
 *
 * With reduced motion no trigger is created at all and the console renders its
 * resting phase, which states the whole claim on its own.
 */
export function useScrollPhase(phases, { reduced, target, start = 'top 82%', end = 'bottom 38%' }) {
  const rest = phases.length - 1
  const [phase, setPhase] = useState(rest)

  useEffect(() => {
    const node = target?.current
    if (reduced || !node) return undefined

    const total = phases.reduce((sum, item) => sum + (item.span ?? 1), 0)
    let run = 0
    const stops = phases.map((item) => {
      run += item.span ?? 1
      return run / total
    })

    let last = -1
    const apply = (progress) => {
      let next = stops.findIndex((stop) => progress < stop)
      if (next < 0) next = rest
      if (next === last) return
      last = next
      setPhase(next)
    }

    const trigger = ScrollTrigger.create({
      trigger: node,
      start,
      end,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })

    return () => trigger.kill()
  }, [end, phases, reduced, rest, start, target])

  return reduced ? rest : phase
}
