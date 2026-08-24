import { useEffect, useRef, useCallback } from 'react'

const TAU = Math.PI * 2

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function noise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

export default function TridentCanvas({ animate = true }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const frameRef = useRef(0)

  const accent = [90, 160, 230]   // bright blue for dark bg
  const dim = [50, 90, 140]       // muted blue

  const init = useCallback((canvas) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (!w || !h) return
    canvas.width = w * dpr
    canvas.height = h * dpr

    const cx = w / 2, cy = h / 2
    const sc = Math.min(w, h) / 500
    const orbitR = 145 * sc
    const coreR = 32 * sc

    const gates = Array.from({ length: 5 }, (_, i) => {
      const a = (i * 72 - 90) * (Math.PI / 180)
      return { x: cx + orbitR * Math.cos(a), y: cy + orbitR * Math.sin(a), angle: a, heat: 0 }
    })

    // Dense nebula field
    const field = []
    for (let i = 0; i < 400; i++) {
      const a = Math.random() * TAU
      const rr = Math.random()
      const r = coreR * 0.3 + rr * (orbitR * 1.05 - coreR * 0.3)
      // Cluster more particles near gates and core
      const nearGate = gates.some(g => Math.hypot(cx + Math.cos(a) * r - g.x, cy + Math.sin(a) * r - g.y) < 35 * sc)
      const nearCore = r < coreR * 1.8
      field.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        vx: 0, vy: 0,
        size: nearCore ? (0.8 + Math.random() * 2.5) : nearGate ? (0.6 + Math.random() * 2) : (0.3 + Math.random() * 1.2),
        alpha: nearCore ? (0.25 + Math.random() * 0.5) : nearGate ? (0.15 + Math.random() * 0.4) : (0.05 + Math.random() * 0.15),
        seed: Math.random() * 100,
      })
    }

    // Energy streams flowing core → gates
    const streams = []
    for (let g = 0; g < 5; g++) {
      for (let j = 0; j < 18; j++) {
        streams.push({
          gate: g, t: Math.random(),
          speed: 0.0018 + Math.random() * 0.0035,
          spread: (Math.random() - 0.5) * 16 * sc,
          size: 0.5 + Math.random() * 2,
          bright: 0.4 + Math.random() * 0.6,
          trail: [],
        })
      }
    }

    // Core plasma
    const plasma = []
    for (let i = 0; i < 55; i++) {
      plasma.push({
        angle: Math.random() * TAU,
        radius: Math.random() * coreR * 0.85,
        speed: (0.012 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.5 + Math.random() * 2.2,
        bright: 0.4 + Math.random() * 0.6,
        wobble: Math.random() * TAU,
        wobbleSpd: 0.01 + Math.random() * 0.03,
        wobbleAmp: 1 + Math.random() * 5,
      })
    }

    stateRef.current = { w, h, cx, cy, sc, dpr, orbitR, coreR, gates, field, streams, plasma, time: 0, sweep: 0 }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    init(canvas)

    const ro = new ResizeObserver(() => init(canvas))
    ro.observe(canvas)

    const onMouse = (e) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)

    let running = true
    const frame = () => {
      if (!running) return
      frameRef.current = requestAnimationFrame(frame)
      const s = stateRef.current
      if (!s) return
      const { w, h, cx, cy, sc, dpr, orbitR, coreR, gates, field, streams, plasma } = s
      const [ar, ag, ab] = accent
      const [dr, dg, db] = dim

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Dark background
      ctx.fillStyle = '#0a0f18'
      ctx.fillRect(0, 0, w, h)

      if (!animate) { drawStatic(ctx, s); return }

      s.time += 0.016
      s.sweep += 0.004
      const mx = mouseRef.current.x, my = mouseRef.current.y
      const mouseIn = Math.hypot(mx - cx, my - cy) < orbitR * 1.5

      // ── Atmosphere ──
      const atmo = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitR * 1.5)
      atmo.addColorStop(0, 'rgba(30,60,110,0.25)')
      atmo.addColorStop(0.3, 'rgba(20,40,80,0.1)')
      atmo.addColorStop(0.7, 'rgba(10,20,40,0.03)')
      atmo.addColorStop(1, 'rgba(10,15,24,0)')
      ctx.fillStyle = atmo
      ctx.fillRect(0, 0, w, h)

      // ── Containment rings ──
      ;[coreR * 1.6, orbitR * 0.55, orbitR * 0.78, orbitR, orbitR * 1.15].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU)
        ctx.strokeStyle = `rgba(${dr},${dg},${db},${i === 3 ? 0.2 : 0.06})`
        ctx.lineWidth = i === 3 ? 0.8 : 0.4
        if (i > 3) ctx.setLineDash([2 * sc, 6 * sc])
        ctx.stroke(); ctx.setLineDash([])
      })

      // Pentagon
      ctx.beginPath()
      gates.forEach((g, i) => { i === 0 ? ctx.moveTo(g.x, g.y) : ctx.lineTo(g.x, g.y) })
      ctx.closePath()
      ctx.strokeStyle = `rgba(${dr},${dg},${db},0.08)`
      ctx.lineWidth = 0.4; ctx.stroke()

      // ── Sweep beam ──
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.sweep)
      const sw = ctx.createConicGradient(0, 0, 0)
      sw.addColorStop(0, `rgba(${ar},${ag},${ab},0.12)`)
      sw.addColorStop(0.04, `rgba(${ar},${ag},${ab},0.04)`)
      sw.addColorStop(0.09, `rgba(${ar},${ag},${ab},0)`)
      sw.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
      ctx.fillStyle = sw
      ctx.beginPath(); ctx.arc(0, 0, orbitR * 1.12, 0, TAU); ctx.fill()
      ctx.restore()

      // ── Nebula field ──
      field.forEach((p) => {
        const nx = noise(p.seed + s.time * 0.12, p.y * 0.004) * 1.2
        const ny = noise(p.x * 0.004, p.seed + s.time * 0.12) * 1.2
        p.vx = (p.vx + nx * 0.015 + (cx - p.x) * 0.0006) * 0.96
        p.vy = (p.vy + ny * 0.015 + (cy - p.y) * 0.0006) * 0.96

        if (mouseIn) {
          const mdx = p.x - mx, mdy = p.y - my
          const md = Math.hypot(mdx, mdy)
          if (md < 80 * sc && md > 0) {
            const f = ((80 * sc - md) / (80 * sc))
            p.vx += (mdx / md) * f * f * 3
            p.vy += (mdy / md) * f * f * 3
          }
        }

        p.x += p.vx; p.y += p.vy
        const dist = Math.hypot(p.x - cx, p.y - cy)
        if (dist > orbitR * 1.15) {
          const a = Math.atan2(p.y - cy, p.x - cx)
          p.x = cx + Math.cos(a) * orbitR * 1.12
          p.y = cy + Math.sin(a) * orbitR * 1.12
          p.vx *= -0.3; p.vy *= -0.3
        }

        const pulse = 0.65 + 0.35 * Math.sin(s.time * 0.9 + p.seed)
        const a = p.alpha * pulse

        if (p.size > 1) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
          g.addColorStop(0, `rgba(${ar},${ag},${ab},${a * 0.5})`)
          g.addColorStop(0.5, `rgba(${ar},${ag},${ab},${a * 0.1})`)
          g.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, TAU)
          ctx.fillStyle = g; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU)
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${a})`; ctx.fill()
      })

      // ── Energy streams ──
      streams.forEach((p) => {
        p.t += p.speed
        if (p.t > 1) { p.t -= 1; p.trail = [] }

        const gate = gates[p.gate]
        const t = p.t
        const ease = t * t * (3 - 2 * t)
        const tx = cx + (gate.x - cx) * ease * 1.08
        const ty = cy + (gate.y - cy) * ease * 1.08
        const perp = p.spread * (1 - ease * 0.7) * (1 + 0.2 * Math.sin(s.time * 3 + t * 8))
        const px = tx + (-Math.sin(gate.angle)) * perp
        const py = ty + Math.cos(gate.angle) * perp

        const fadeIn = Math.min(1, t * 6)
        const fadeOut = Math.max(0, 1 - (t - 0.82) * 6)
        const a = fadeIn * fadeOut * p.bright
        if (a < 0.02) return

        p.trail.push({ x: px, y: py, a })
        if (p.trail.length > 8) p.trail.shift()

        for (let j = 0; j < p.trail.length; j++) {
          const tp = p.trail[j]
          ctx.beginPath(); ctx.arc(tp.x, tp.y, p.size * 0.5, 0, TAU)
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${(j / p.trail.length) * tp.a * 0.2})`
          ctx.fill()
        }

        const hg = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5)
        hg.addColorStop(0, `rgba(${ar},${ag},${ab},${a * 0.8})`)
        hg.addColorStop(0.3, `rgba(${ar},${ag},${ab},${a * 0.2})`)
        hg.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
        ctx.beginPath(); ctx.arc(px, py, p.size * 4, 0, TAU)
        ctx.fillStyle = hg; ctx.fill()

        ctx.beginPath(); ctx.arc(px, py, p.size * 0.6, 0, TAU)
        ctx.fillStyle = `rgba(180,210,255,${Math.min(1, a * 1.2)})`; ctx.fill()
      })

      // ── Gate concentrations ──
      gates.forEach((gate) => {
        const md = Math.hypot(mx - gate.x, my - gate.y)
        gate.heat += ((md < 55 * sc ? 1 : 0) - gate.heat) * 0.06
        const pulse = 0.5 + 0.5 * Math.sin(s.time * 1.4 + gate.angle * 3)
        const int = 0.3 + gate.heat * 0.7 + pulse * 0.15

        const hr = (20 + gate.heat * 14 + pulse * 5) * sc
        const hg = ctx.createRadialGradient(gate.x, gate.y, 0, gate.x, gate.y, hr)
        hg.addColorStop(0, `rgba(${ar},${ag},${ab},${int * 0.6})`)
        hg.addColorStop(0.3, `rgba(${ar},${ag},${ab},${int * 0.15})`)
        hg.addColorStop(0.7, `rgba(${ar},${ag},${ab},${int * 0.03})`)
        hg.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
        ctx.beginPath(); ctx.arc(gate.x, gate.y, hr, 0, TAU)
        ctx.fillStyle = hg; ctx.fill()

        const dotR = (3 + gate.heat * 2.5 + pulse * 0.8) * sc
        const dg2 = ctx.createRadialGradient(gate.x, gate.y, 0, gate.x, gate.y, dotR * 3)
        dg2.addColorStop(0, `rgba(180,215,255,${0.7 + gate.heat * 0.3})`)
        dg2.addColorStop(0.3, `rgba(${ar},${ag},${ab},${0.3 + gate.heat * 0.2})`)
        dg2.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
        ctx.beginPath(); ctx.arc(gate.x, gate.y, dotR * 2.5, 0, TAU)
        ctx.fillStyle = dg2; ctx.fill()
      })

      // ── Core ──
      plasma.forEach((p) => {
        p.angle += p.speed; p.wobble += p.wobbleSpd
        const r = p.radius + Math.sin(p.wobble) * p.wobbleAmp
        const px = cx + Math.cos(p.angle) * r
        const py = cy + Math.sin(p.angle) * r
        const a = p.bright * (0.5 + 0.5 * Math.sin(s.time * 1.5 + p.angle))

        ctx.beginPath(); ctx.arc(px, py, p.size, 0, TAU)
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${a})`; ctx.fill()

        if (p.size > 1.3) {
          const pg = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3)
          pg.addColorStop(0, `rgba(${ar},${ag},${ab},${a * 0.35})`)
          pg.addColorStop(1, `rgba(${ar},${ag},${ab},0)`)
          ctx.beginPath(); ctx.arc(px, py, p.size * 3, 0, TAU)
          ctx.fillStyle = pg; ctx.fill()
        }
      })

      // Core glow layers
      const cp = 0.7 + 0.3 * Math.sin(s.time * 0.7)
      ;[
        [coreR * 2.8, `rgba(20,50,100,${0.12 * cp})`],
        [coreR * 1.6, `rgba(${ar},${ag},${ab},${0.15 * cp})`],
        [coreR * 0.8, `rgba(${ar},${ag},${ab},${0.25 * cp})`],
        [coreR * 0.35, `rgba(180,215,255,${0.7 * cp})`],
      ].forEach(([r, color]) => {
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        cg.addColorStop(0, color)
        cg.addColorStop(1, 'rgba(10,15,24,0)')
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU)
        ctx.fillStyle = cg; ctx.fill()
      })

      // Spinning ring
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.time * 0.2)
      ctx.beginPath(); ctx.arc(0, 0, coreR * 1.3, 0, TAU)
      ctx.setLineDash([2 * sc, 5 * sc])
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.15)`; ctx.lineWidth = 0.5
      ctx.stroke(); ctx.setLineDash([]); ctx.restore()
    }

    const drawStatic = (c, s2) => {
      const { w: sw, h: sh, cx: scx, cy: scy, coreR: scr, orbitR: sor, gates: sg, sc: ss } = s2
      c.fillStyle = '#0a0f18'; c.fillRect(0, 0, sw, sh)
      const bg = c.createRadialGradient(scx, scy, 0, scx, scy, sor * 1.3)
      bg.addColorStop(0, 'rgba(30,60,110,0.15)'); bg.addColorStop(1, 'rgba(10,15,24,0)')
      c.fillStyle = bg; c.fillRect(0, 0, sw, sh)
      c.beginPath(); c.arc(scx, scy, sor, 0, TAU)
      c.strokeStyle = 'rgba(50,90,140,0.12)'; c.lineWidth = 0.5; c.stroke()
      sg.forEach((g) => {
        c.beginPath(); c.moveTo(scx, scy); c.lineTo(g.x, g.y)
        c.strokeStyle = 'rgba(50,90,140,0.08)'; c.lineWidth = 0.3; c.stroke()
        const dg = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, 10 * ss)
        dg.addColorStop(0, 'rgba(90,160,230,0.5)'); dg.addColorStop(1, 'rgba(90,160,230,0)')
        c.beginPath(); c.arc(g.x, g.y, 10 * ss, 0, TAU); c.fillStyle = dg; c.fill()
      })
      const cc = c.createRadialGradient(scx, scy, 0, scx, scy, scr * 0.5)
      cc.addColorStop(0, 'rgba(180,215,255,0.7)'); cc.addColorStop(1, 'rgba(90,160,230,0)')
      c.beginPath(); c.arc(scx, scy, scr * 0.5, 0, TAU); c.fillStyle = cc; c.fill()
    }

    frame()
    return () => { running = false; cancelAnimationFrame(frameRef.current); ro.disconnect(); canvas.removeEventListener('mousemove', onMouse); canvas.removeEventListener('mouseleave', onLeave) }
  }, [init, animate])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block', borderRadius: 'inherit' }} />
}
