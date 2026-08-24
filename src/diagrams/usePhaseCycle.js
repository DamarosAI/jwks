import { useEffect, useState } from 'react'

/**
 * Discrete phase driver for the technical schematics.
 *
 * Doctrine: motion shows state change, provenance, and continuity. It never
 * decorates authority. So the diagrams are a state machine, not a particle
 * field - each phase holds for its own duration, then advances, and CSS
 * transitions tween between the positions a phase implies.
 *
 * With `animate` false nothing is scheduled at all. The hook returns the
 * committed rest phase, so the still diagram carries the whole claim and there
 * is no frame work off-screen, on narrow viewports, or under reduced motion.
 */
export function usePhaseCycle(phases, { animate, restPhase }) {
  const rest = restPhase ?? phases.length - 1
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!animate) return undefined
    let step = 0
    let timer = 0
    const advance = () => {
      step += 1
      setTick((prev) => prev + 1)
      timer = window.setTimeout(advance, phases[step % phases.length].hold)
    }
    timer = window.setTimeout(advance, phases[0].hold)
    return () => window.clearTimeout(timer)
  }, [animate, phases])

  const cycle = Math.floor(tick / phases.length)
  return animate ? { phase: tick % phases.length, cycle } : { phase: rest, cycle }
}
