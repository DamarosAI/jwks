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

/**
 * A run the reader travels THROUGH rather than past.
 *
 * `useScrollRun` walks a figure that stays in the flow of the page: the page
 * keeps moving, the drawing advances as it goes by, and the reader is looking
 * at something. That is right for an instrument on a bench and it is wrong for
 * a place - and it is fatal for a moving camera, because a camera that flies
 * across a landscape while the landscape is itself sliding up the page is two
 * motions fighting for the same eye.
 *
 * So this one pins. While pinned the page stops and scroll becomes the only
 * clock the figure has, which is what lets the camera own the screen: the
 * reader's gesture stops meaning "leave" and starts meaning "travel".
 *
 * `travel` is in viewport heights, so the flight costs the same amount of
 * reading on every monitor. Beats are weighted by `span`, so the two that carry
 * the argument - the world as found, and the world once it is one - own the
 * widest stretches and are what a parked reader is looking at.
 *
 * IT DOES NOT PIN WHERE PINNING IS A TRAP. Below the breakpoint the page stops
 * answering the one gesture a reader is certain of, on the device where that is
 * most alarming, and there is not enough sheet left to draw what they stopped
 * for. There the same beats play in the flow of the page instead. Reduced
 * motion gets no trigger at all and parks on the resting beat, which states the
 * finished claim on its own.
 */
export function usePinnedRun(phases, { reduced, narrow, travel = 3, flow = 1.4, onScrub }) {
  const scope = useRef(null)
  const pin = useRef(null)
  const rest = phases.length - 1
  const [phase, setPhase] = useState(0)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const node = scope.current
    // Reduced motion never creates a trigger. The figure is parked on its
    // resting beat by the return below, so there is no state to set here and
    // nothing to tear down.
    if (!node || reduced) return undefined

    const boot = () => setBooted(true)
    const total = phases.reduce((sum, item) => sum + (item.span ?? 1), 0)
    let run = 0
    const stops = phases.map((item) => {
      run += item.span ?? 1
      return run / total
    })

    let last = -1
    const apply = (progress) => {
      if (progress > 0) boot()
      const raw = Math.min(1, Math.max(0, progress))

      // TWO READINGS OF ONE SCROLL, AND THEY ARE DELIBERATELY DIFFERENT.
      //
      // A camera is the reader's own head, so it takes the RAW value: linear,
      // one to one with the wheel, no easing anywhere between the gesture and
      // the transform. Anything else - an eased mapping, a CSS transition on
      // the way out - puts a spring between the finger and the frame, and a
      // camera on a spring is the single loudest way a scroll-driven scene
      // reads as out of sync. It is written straight to a custom property so
      // nothing in React hears about it.
      //
      // A STATE is not a position. Whether the sky has sorted, whether a
      // district has stood, whether the conduit carries - those are things that
      // happen, and a thing that happens should run at its own pace once it has
      // been triggered rather than being scrubbed frame by frame. So they still
      // switch on the eased reading, and the stylesheet times them.
      if (onScrub) onScrub(raw)

      const along = ease(raw)
      let next = stops.findIndex((stop) => along < stop)
      if (next < 0) next = rest
      if (next === last) return
      last = next
      setPhase(next)
    }

    apply(0)

    const trigger = ScrollTrigger.create(narrow ? {
      trigger: node,
      start: 'top 76%',
      end: () => `+=${Math.round(node.getBoundingClientRect().height * flow)}`,
      onEnter: boot,
      onEnterBack: boot,
      onLeave: boot,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    } : {
      trigger: node,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * travel)}`,
      pin: pin.current ?? node,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: boot,
      onEnterBack: boot,
      onLeave: boot,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(trigger.progress)

    // `kill(true)` - REVERT, not just detach. A pinned trigger rewrites the
    // document: it wraps the pinned element in a spacer and takes over its
    // position. A bare `kill()` drops the trigger and leaves that wrapper
    // standing, so under StrictMode - where every effect runs twice - the
    // second trigger is left measuring a document the first one rearranged, and
    // the section reserves three screens of scroll while pinning nothing in it.
    return () => trigger.kill(true)
  }, [flow, narrow, onScrub, phases, reduced, rest, travel])

  return [scope, pin, reduced ? rest : phase, reduced || booted]
}
