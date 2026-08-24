import { useEffect, useRef, useCallback } from 'react'

const TAU = Math.PI * 2

export default function NectarCanvas({ animate = true }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999, down: false, grabbed: -1 })
  const frameRef = useRef(0)

  const blue = [90, 160, 230]
  const purple = [160, 140, 255]

  const init = useCallback((canvas) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (!w || !h) return
    canvas.width = w * dpr
    canvas.height = h * dpr

    const cx = w / 2, cy = h / 2
    const sc = Math.min(w, h) / 500
    const layoutR = 135 * sc

    const sites = []
    sites.push({ x: cx, y: cy, homeX: cx, homeY: cy, vx: 0, vy: 0, r: 22 * sc, heat: 0 })
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180)
      const x = cx + layoutR * Math.cos(a)
      const y = cy + layoutR * Math.sin(a)
      sites.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0, r: 15 * sc, heat: 0 })
    }

    const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,2],[2,3],[3,4],[4,5],[5,6],[6,1]]

    // Data particles — wide orbits so they're visible OUTSIDE the node glow
    const data = []
    sites.forEach((site, si) => {
      const count = si === 0 ? 50 : 28
      for (let j = 0; j < count; j++) {
        const a = Math.random() * TAU
        const minR = 15 * sc
        const maxR = (si === 0 ? 55 : 40) * sc
        const r = minR + Math.random() * (maxR - minR)
        data.push({
          site: si, angle: a, orbit: r,
          speed: (0.005 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
          size: 1.0 + Math.random() * 2.5,
          alpha: 0.3 + Math.random() * 0.6,
          wobble: Math.random() * TAU,
          wobbleSpd: 0.004 + Math.random() * 0.012,
          wobbleAmp: 1 + Math.random() * 4,
        })
      }
    })

    // Intelligence particles — purple, flowing between sites
    const intel = []
    for (let i = 0; i < 90; i++) {
      const ei = Math.floor(Math.random() * edges.length)
      intel.push({
        edge: ei, t: Math.random(),
        speed: 0.003 + Math.random() * 0.007,
        dir: Math.random() > 0.5 ? 1 : -1,
        spread: (Math.random() - 0.5) * 18 * sc,
        size: 1.0 + Math.random() * 2.5,
        bright: 0.5 + Math.random() * 0.5,
        trail: [],
      })
    }

    // Background dust
    const nebula = []
    for (let i = 0; i < 100; i++) {
      nebula.push({
        x: Math.random() * w, y: Math.random() * h,
        size: 0.3 + Math.random() * 1.0,
        alpha: 0.03 + Math.random() * 0.07,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.15,
      })
    }

    stateRef.current = { w, h, cx, cy, sc, dpr, layoutR, sites, edges, data, intel, nebula, time: 0 }
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
      const m = mouseRef.current
      m.x = e.clientX - r.left; m.y = e.clientY - r.top
    }
    const onDown = (e) => {
      onMouse(e)
      const s = stateRef.current; if (!s) return
      const m = mouseRef.current; m.down = true
      for (let i = s.sites.length - 1; i >= 0; i--) {
        if (Math.hypot(m.x - s.sites[i].x, m.y - s.sites[i].y) < s.sites[i].r * 2.5) {
          m.grabbed = i; canvas.style.cursor = 'grabbing'; return
        }
      }
    }
    const onUp = () => { mouseRef.current.down = false; mouseRef.current.grabbed = -1; canvas.style.cursor = '' }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999, down: false, grabbed: -1 }; canvas.style.cursor = '' }

    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onLeave)

    let running = true
    const frame = () => {
      if (!running) return
      frameRef.current = requestAnimationFrame(frame)
      const s = stateRef.current
      if (!s) return
      const { w, h, cx, cy, sc, dpr, sites, edges, data: dataP, intel, nebula } = s
      const [br, bg2, bb] = blue
      const [pr, pg, pb] = purple

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#0a0f18'
      ctx.fillRect(0, 0, w, h)

      if (!animate) { drawStatic(ctx, s); return }

      s.time += 0.016
      const mx = mouseRef.current.x, my = mouseRef.current.y
      const grabbed = mouseRef.current.grabbed

      // Atmosphere
      const atmo = ctx.createRadialGradient(cx, cy, 0, cx, cy, s.layoutR * 1.8)
      atmo.addColorStop(0, 'rgba(25,35,65,0.25)')
      atmo.addColorStop(0.4, 'rgba(18,25,50,0.1)')
      atmo.addColorStop(1, 'rgba(10,15,24,0)')
      ctx.fillStyle = atmo; ctx.fillRect(0, 0, w, h)

      // Background dust
      nebula.forEach((p) => {
        p.x += p.dx; p.y += p.dy
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU)
        ctx.fillStyle = `rgba(${br},${bg2},${bb},${p.alpha})`; ctx.fill()
      })

      // Site physics
      sites.forEach((site, i) => {
        if (i === grabbed) {
          site.x += (mx - site.x) * 0.3; site.y += (my - site.y) * 0.3
          site.vx = 0; site.vy = 0
        } else {
          site.vx += (site.homeX - site.x) * 0.015
          site.vy += (site.homeY - site.y) * 0.015
          site.vx *= 0.88; site.vy *= 0.88
          site.x += site.vx; site.y += site.vy
        }
        const md = Math.hypot(mx - site.x, my - site.y)
        site.heat += ((md < site.r * 4 ? 1 : 0) - site.heat) * 0.05
      })

      // ── Edges with glow ──
      edges.forEach(([a, b]) => {
        const sa = sites[a], sb = sites[b]
        const isHub = a === 0 || b === 0
        const hot = sa.heat > 0.3 || sb.heat > 0.3

        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y)
        ctx.strokeStyle = `rgba(${pr},${pg},${pb},${hot ? 0.15 : isHub ? 0.06 : 0.03})`
        ctx.lineWidth = hot ? 4 : isHub ? 2.5 : 1.5; ctx.stroke()

        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y)
        ctx.strokeStyle = `rgba(${pr},${pg},${pb},${hot ? 0.3 : isHub ? 0.12 : 0.06})`
        ctx.lineWidth = hot ? 1 : 0.5; ctx.stroke()
      })

      // ── Site nodes (drawn BEFORE particles so particles render on top) ──
      sites.forEach((site, i) => {
        const pulse = 0.7 + 0.3 * Math.sin(s.time * 1.2 + i * 1.5)
        const int = 0.45 + site.heat * 0.55 + pulse * 0.1
        const r = site.r * (1 + site.heat * 0.2)
        const isCenter = i === 0

        // Ambient glow — tighter so particles outside are visible
        const ambR = r * (isCenter ? 3.2 : 2.5)
        const og = ctx.createRadialGradient(site.x, site.y, 0, site.x, site.y, ambR)
        og.addColorStop(0, `rgba(${br},${bg2},${bb},${int * 0.5})`)
        og.addColorStop(0.35, `rgba(${br},${bg2},${bb},${int * 0.12})`)
        og.addColorStop(1, `rgba(${br},${bg2},${bb},0)`)
        ctx.beginPath(); ctx.arc(site.x, site.y, ambR, 0, TAU)
        ctx.fillStyle = og; ctx.fill()

        // Bright center
        const ig = ctx.createRadialGradient(site.x, site.y, 0, site.x, site.y, r * 1.5)
        ig.addColorStop(0, `rgba(190,220,255,${0.75 + site.heat * 0.25})`)
        ig.addColorStop(0.3, `rgba(${br},${bg2},${bb},${int * 0.6})`)
        ig.addColorStop(0.7, `rgba(${br},${bg2},${bb},${int * 0.08})`)
        ig.addColorStop(1, `rgba(${br},${bg2},${bb},0)`)
        ctx.beginPath(); ctx.arc(site.x, site.y, r * 1.5, 0, TAU)
        ctx.fillStyle = ig; ctx.fill()

        // Ring
        ctx.beginPath(); ctx.arc(site.x, site.y, r, 0, TAU)
        ctx.strokeStyle = `rgba(${br},${bg2},${bb},${0.25 + site.heat * 0.25})`
        ctx.lineWidth = 0.7; ctx.stroke()

        // Center spinning dashed orbit
        if (isCenter) {
          ctx.save(); ctx.translate(site.x, site.y); ctx.rotate(s.time * 0.06)
          ctx.beginPath(); ctx.arc(0, 0, r * 3.5, 0, TAU)
          ctx.setLineDash([2 * sc, 5 * sc])
          ctx.strokeStyle = `rgba(${pr},${pg},${pb},0.1)`; ctx.lineWidth = 0.5; ctx.stroke()
          ctx.setLineDash([]); ctx.restore()
        }
      })

      // ── Data particles (blue — orbit sites, never leave — drawn ON TOP of nodes) ──
      dataP.forEach((p) => {
        p.angle += p.speed; p.wobble += p.wobbleSpd
        const site = sites[p.site]
        const r = p.orbit + Math.sin(p.wobble) * p.wobbleAmp
        const px = site.x + Math.cos(p.angle) * r
        const py = site.y + Math.sin(p.angle) * r

        const pulse = 0.65 + 0.35 * Math.sin(s.time * 0.8 + p.angle * 2)
        const a = p.alpha * pulse

        // Glow
        const gr = p.size * 4.5
        const dg = ctx.createRadialGradient(px, py, 0, px, py, gr)
        dg.addColorStop(0, `rgba(${br},${bg2},${bb},${a * 0.6})`)
        dg.addColorStop(0.35, `rgba(${br},${bg2},${bb},${a * 0.15})`)
        dg.addColorStop(1, `rgba(${br},${bg2},${bb},0)`)
        ctx.beginPath(); ctx.arc(px, py, gr, 0, TAU)
        ctx.fillStyle = dg; ctx.fill()

        // Bright core
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, TAU)
        ctx.fillStyle = `rgba(${br},${bg2},${bb},${Math.min(1, a * 1.2)})`; ctx.fill()
      })

      // ── Intelligence streams (purple — crosses boundaries — drawn on top of everything) ──
      intel.forEach((p) => {
        p.t += p.speed * p.dir
        if (p.t > 1) { p.t = 0; p.dir = Math.random() > 0.3 ? 1 : -1; p.edge = Math.floor(Math.random() * edges.length); p.trail = [] }
        if (p.t < 0) { p.t = 1; p.dir = Math.random() > 0.3 ? 1 : -1; p.edge = Math.floor(Math.random() * edges.length); p.trail = [] }

        const [ea, eb] = edges[p.edge]
        const sa = sites[ea], sb = sites[eb]
        const t = p.t
        const ex = sa.x + (sb.x - sa.x) * t
        const ey = sa.y + (sb.y - sa.y) * t
        const dx = sb.x - sa.x, dy = sb.y - sa.y
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len, ny = dx / len
        const wave = Math.sin(t * 10 + s.time * 2.5) * p.spread * (1 - Math.abs(t - 0.5) * 1.2)
        const fx = ex + nx * wave
        const fy = ey + ny * wave

        const fadeIn = Math.min(1, t * 4)
        const fadeOut = Math.max(0, 1 - (t - 0.8) * 5)
        const a = fadeIn * fadeOut * p.bright

        p.trail.push({ x: fx, y: fy, a })
        if (p.trail.length > 8) p.trail.shift()

        for (let j = 0; j < p.trail.length; j++) {
          const tp = p.trail[j]
          const ta = (j / p.trail.length) * tp.a
          ctx.beginPath(); ctx.arc(tp.x, tp.y, p.size * 0.5, 0, TAU)
          ctx.fillStyle = `rgba(${pr},${pg},${pb},${ta * 0.25})`; ctx.fill()
        }

        if (a > 0.03) {
          const gr = p.size * 6
          const ig = ctx.createRadialGradient(fx, fy, 0, fx, fy, gr)
          ig.addColorStop(0, `rgba(${pr},${pg},${pb},${a * 0.7})`)
          ig.addColorStop(0.25, `rgba(${pr},${pg},${pb},${a * 0.2})`)
          ig.addColorStop(1, `rgba(${pr},${pg},${pb},0)`)
          ctx.beginPath(); ctx.arc(fx, fy, gr, 0, TAU)
          ctx.fillStyle = ig; ctx.fill()

          ctx.beginPath(); ctx.arc(fx, fy, p.size * 0.7, 0, TAU)
          ctx.fillStyle = `rgba(220,210,255,${Math.min(1, a * 1.3)})`; ctx.fill()
        }
      })
    }

    const drawStatic = (c, s2) => {
      const { w: sw, h: sh, sites: ss, edges: se } = s2
      const [br2, bg3, bb2] = blue
      const [pr2, pg2, pb2] = purple
      c.fillStyle = '#0a0f18'; c.fillRect(0, 0, sw, sh)
      const bg = c.createRadialGradient(s2.cx, s2.cy, 0, s2.cx, s2.cy, s2.layoutR * 1.5)
      bg.addColorStop(0, 'rgba(25,30,60,0.12)'); bg.addColorStop(1, 'rgba(10,15,24,0)')
      c.fillStyle = bg; c.fillRect(0, 0, sw, sh)
      se.forEach(([a, b]) => {
        c.beginPath(); c.moveTo(ss[a].x, ss[a].y); c.lineTo(ss[b].x, ss[b].y)
        c.strokeStyle = `rgba(${pr2},${pg2},${pb2},0.06)`; c.lineWidth = 0.3; c.stroke()
      })
      ss.forEach((site) => {
        const sg = c.createRadialGradient(site.x, site.y, 0, site.x, site.y, site.r * 1.5)
        sg.addColorStop(0, `rgba(180,215,255,0.5)`); sg.addColorStop(1, `rgba(${br2},${bg3},${bb2},0)`)
        c.beginPath(); c.arc(site.x, site.y, site.r * 1.5, 0, TAU); c.fillStyle = sg; c.fill()
      })
    }

    frame()
    return () => {
      running = false; cancelAnimationFrame(frameRef.current); ro.disconnect()
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [init, animate])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block', borderRadius: 'inherit', cursor: 'grab' }} />
}
