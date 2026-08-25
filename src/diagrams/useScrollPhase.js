import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ease = (t) => t * t * (3 - 2 * t)

/**
 * One trigger, one figure, one run.
 *
 * Assembly and phase used to hang off two separate triggers with two different
 * anchors - the drawing for one, the whole section for the other. That is why
 * the run drifted between window sizes: once the section stacks, its copy
 * column stands several hundred pixels above the drawing, so the opening
 * phases were spent while the figure was still below the fold and a reader on
 * a phone met it already halfway through its own run.
 *
 * Both now hang off the figure, over a scroll distance proportional to the
 * figure rather than to the viewport, so the same run plays in the same order
 * and at the same pace on a 390px phone and a 1920px desktop.
 *
 * The first `lead` of the range assembles the drawing and the rest walks the
 * phases, which is why nothing is ever drawn through a stack that has not
 * finished arriving. `--spread` is written straight onto the node, so assembly
 * scrubs on the compositor and only a phase change costs a React render.
 *
 * `--charge` is the second half of that: the drawing arrives dark and comes up
 * a beat behind the solids landing. Assembly moves the geometry; charge is the
 * system finding power - the ink gains, the footprint hairlines climb out of
 * the ground, and every ambient clock in the figure starts at once. It used to
 * be that all of it ran from the first frame, so the figure was already busy
 * while it was still sliding into place and nothing ever read as switching on.
 * The two ramps overlap deliberately: power arrives while the last deck is
 * still settling, the way a machine does rather than the way a slideshow does.
 *
 * Each phase carries a `span` weight, so the beat that matters - the hold at
 * the shut aperture, the steady state after coverage compounds - owns the
 * widest stretch of scroll and is what a reader parked mid-section sees. The
 * range is anchored so the stack lands early and the phases play while the
 * figure crosses the middle of the screen, rather than being spent while it is
 * still below the fold. With reduced motion no trigger is created at all: the
 * figure is parked open, charged, on its resting phase, which states the whole
 * claim on its own.
 */
export function useScrollRun(phases, { reduced, lead = 0.16, start = 'top 90%', travel = 1.25 }) {
  const figure = useRef(null)
  const rest = phases.length - 1
  const [phase, setPhase] = useState(rest)

  useEffect(() => {
    const node = figure.current
    if (!node) return undefined

    if (reduced) {
      node.style.setProperty('--spread', '1')
      node.style.setProperty('--charge', '1')
      return undefined
    }

    const total = phases.reduce((sum, item) => sum + (item.span ?? 1), 0)
    let run = 0
    const stops = phases.map((item) => {
      run += item.span ?? 1
      return run / total
    })

    // Power comes up behind the geometry: it starts while the stack is still
    // landing and settles just after it does.
    const wake = lead * 0.6
    const surge = lead * 1.4

    let last = -1
    const apply = (progress) => {
      const p = Math.min(1, Math.max(0, progress))
      node.style.setProperty('--spread', ease(Math.min(1, p / lead)).toFixed(4))
      node.style.setProperty('--charge', ease(Math.min(1, Math.max(0, (p - wake) / surge))).toFixed(4))
      const along = Math.max(0, (p - lead) / (1 - lead))
      let next = stops.findIndex((stop) => along < stop)
      if (next < 0) next = rest
      if (next === last) return
      last = next
      setPhase(next)
    }

    apply(0)
    const trigger = ScrollTrigger.create({
      trigger: node,
      start,
      end: () => `+=${Math.round(node.getBoundingClientRect().height * travel)}`,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(trigger.progress)

    return () => trigger.kill()
  }, [lead, phases, reduced, rest, start, travel])

  return [figure, reduced ? rest : phase]
}

/**
 * The same scroll read as one continuous value, for things that open rather
 * than advance. Returns a ref for the element, which is also what drives the
 * scrub: it writes a 0-to-1 `--spread` custom property as the element climbs
 * into view, which the stylesheet uses to drift and gain the page lattice
 * behind each section. Setting a custom property does not re-render React, so
 * this scrubs on the compositor rather than through the component tree.
 *
 * With reduced motion the element is simply parked fully open.
 */
export function useScrollSpread({ reduced, start = 'top bottom', end = 'top 44%' }) {
  const target = useRef(null)

  useEffect(() => {
    const node = target.current
    if (!node) return undefined

    if (reduced) {
      node.style.setProperty('--spread', '1')
      return undefined
    }

    const apply = (progress) => {
      node.style.setProperty('--spread', ease(Math.min(1, Math.max(0, progress))).toFixed(4))
    }

    apply(0)
    const trigger = ScrollTrigger.create({
      trigger: node,
      start,
      end,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(trigger.progress)

    return () => trigger.kill()
  }, [end, reduced, start])

  return target
}
