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
 * Booting is not a scrub. It used to be: the first slice of the scroll range
 * assembled the drawing a frame at a time, which meant the machine came on at
 * whatever rate the reader happened to be turning the wheel, stalled if they
 * stopped, and ran backwards if they scrolled up. A machine powers up at its
 * own pace. So the figure boots once, when the reader arrives, and the
 * stylesheet does the easing: `--spread` and `--charge` are registered custom
 * properties, so adding one class transitions every calc() that reads them -
 * the solids settle, the ink gains, the footprint climbs out of the ground and
 * every ambient clock starts, on one timeline nobody can scrub.
 *
 * That leaves scroll doing the one job it is good at: walking the run. Each
 * phase carries a `span` weight, so the beat that matters - the hold at the
 * shut shutter, the steady state after coverage compounds - owns the widest
 * stretch and is what a reader parked mid-section sees.
 *
 * With reduced motion no trigger is created at all: the figure is parked open,
 * charged and booted on its resting phase, which states the whole claim on its
 * own.
 */
export function useScrollRun(phases, { reduced, start = 'top 88%', travel = 1.15 }) {
  const figure = useRef(null)
  const rest = phases.length - 1
  const [phase, setPhase] = useState(rest)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const node = figure.current
    if (!node) return undefined

    // Booted is state and not a class added to the node, because the figure
    // re-renders on every phase and React rewrites `class` from what it last
    // rendered - an imperatively added class survives until the first tone
    // change and is then silently wiped, which is exactly the frame the reader
    // is looking at.
    const boot = () => setBooted(true)
    // A figure already on screen at mount has no entry to wait for.
    if (reduced || node.getBoundingClientRect().top < window.innerHeight) boot()
    if (reduced) return undefined

    const total = phases.reduce((sum, item) => sum + (item.span ?? 1), 0)
    let run = 0
    const stops = phases.map((item) => {
      run += item.span ?? 1
      return run / total
    })

    let last = -1
    const apply = (progress) => {
      // Any progress at all means the reader has reached the figure. Booting off
      // the crossing callbacks alone misses the reader who arrives by a jump -
      // a hash link, a restored scroll position, a fast flick past the end.
      if (progress > 0) boot()
      const along = ease(Math.min(1, Math.max(0, progress)))
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
      onEnter: boot,
      onEnterBack: boot,
      onLeave: boot,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(trigger.progress)

    return () => trigger.kill()
  }, [phases, reduced, rest, start, travel])

  return [figure, reduced ? rest : phase, reduced || booted]
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
