/* ============================================================
 * Trident & Luna - substrate mini-animations (hero #field port).
 *   trident: phyllotaxis + counter-rotating synapses on hover
 *   luna:    dense counter-rotating elliptical rings on hover
 * ============================================================ */
(function () {
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvases = [].slice.call(document.querySelectorAll("canvas.mini[data-mode]"));
  if (!canvases.length) return;
  var PF = window.DamarosAnim ? DamarosAnim.perf() : { mobile: matchMedia("(hover: none), (pointer: coarse)").matches || window.innerWidth <= 900, dpr: Math.min(2, window.devicePixelRatio || 1), glow: 1 };
  var MOBILE = PF.mobile;
  var SFX = PF.glow;
  var DPR = PF.dpr;
  var COL = readCol();

  function readCol() {
    var cs = getComputedStyle(document.documentElement);
    function g(n) { return cs.getPropertyValue(n).trim(); }
    return { accent2: g("--accent-2") || "#A9C0D6", luna: g("--luna") || "#C084FC", line: g("--bd") || "#2a3340" };
  }

  new MutationObserver(function () { COL = readCol(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  var schemeMq = window.matchMedia("(prefers-color-scheme: light)");
  var onScheme = function () { COL = readCol(); };
  if (schemeMq.addEventListener) schemeMq.addEventListener("change", onScheme);
  else if (schemeMq.addListener) schemeMq.addListener(onScheme);

  function easeInOut(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  function make(canvas) {
    var mode = canvas.dataset.mode;
    var ctx = canvas.getContext("2d");
    var TOUCH = matchMedia("(hover: none), (pointer: coarse)").matches;
    var W = 0, H = 0, N = mode === "luna" ? (MOBILE ? 72 : 90) : 46, parts = [], tact = [], decor = {}, morph = 0;
    var mouse = { x: -9999, y: -9999, inside: false };
    for (var i = 0; i < N; i++) parts.push({ x: 0, y: 0, tx: 0, ty: 0, r: 1.0 + Math.random() * 1.05, ph: Math.random() * 6.28, ring: 0 });

    function compute() {
      var cx = W * 0.5, cy = H * 0.5, R = Math.min(W, H) * 0.4;
      decor = { cx: cx, cy: cy, R: R };
      if (mode === "trident") {
        parts.length = N;
        parts.forEach(function (q, i) {
          var a = i * 2.39996, rr = Math.sqrt(i / N) * R * 1.02;
          q.tx = cx + Math.cos(a) * rr; q.ty = cy + Math.sin(a) * rr * 0.84;
        });
        decor.tneighbors = [];
        for (var ti = 0; ti < N; ti++) {
          var ds = [];
          for (var tj = 0; tj < N; tj++) {
            if (ti === tj) continue;
            var ax = parts[ti].tx - parts[tj].tx, ay = parts[ti].ty - parts[tj].ty;
            ds.push([ax * ax + ay * ay, tj]);
          }
          ds.sort(function (a, b) { return a[0] - b[0]; });
          decor.tneighbors[ti] = [ds[0][1], ds[1][1], ds[2][1], ds[3][1]];
        }
        for (var tz = 0; tz < N; tz++) tact[tz] = 0;
      } else {
        decor.rings = [R * 0.5, R * 0.74, R * 0.98];
        var lcnt = [0, 0, 0];
        parts.forEach(function (q, i) { lcnt[i % 3]++; });
        var lidx = [0, 0, 0];
        parts.forEach(function (q, i) {
          var ring = i % 3, k = lidx[ring]++, a = (k / lcnt[ring]) * 6.2832 + ring * 0.4, rr = decor.rings[ring];
          q.ring = ring; q.tx = cx + Math.cos(a) * rr; q.ty = cy + Math.sin(a) * rr * 0.84;
        });
      }
    }

    function layout() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      compute();
      if (!layout.done) {
        parts.forEach(function (q) { q.x = q.tx; q.y = q.ty; });
        layout.done = true;
      }
    }

    if (!TOUCH) {
      canvas.style.touchAction = "none";
      canvas.addEventListener("pointermove", function (ev) {
        var r = canvas.getBoundingClientRect();
        mouse.x = ev.clientX - r.left; mouse.y = ev.clientY - r.top; mouse.inside = true;
      });
      canvas.addEventListener("pointerleave", function () {
        mouse.inside = false; mouse.x = -9999; mouse.y = -9999;
      });
    }

    function render(now) {
      var time = now / 1000, e = easeInOut(morph);
      var cx = decor.cx, cy = decor.cy, R = decor.R;
      var mx = mouse.x, my = mouse.y, hov = !TOUCH && mouse.inside;
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.lineWidth = 1;

      if (mode === "trident") {
        if (hov) {
          var tr = Math.max(14, R * 0.3);
          for (var ai = 0; ai < N; ai++) {
            var ddx = parts[ai].x - mx, ddy = parts[ai].y - my, dd = ddx * ddx + ddy * ddy;
            if (dd < tr * tr) {
              var sd = 1 - Math.sqrt(dd) / tr, seed = 0.42 + 0.34 * sd;
              if (seed > (tact[ai] || 0)) tact[ai] = seed;
            }
          }
        }
        var nxt = [];
        for (var ui = 0; ui < N; ui++) {
          var bv = (tact[ui] || 0) * 0.9, nbs = decor.tneighbors[ui];
          for (var ni = 0; ni < nbs.length; ni++) {
            var nv = (tact[nbs[ni]] || 0) * 0.8;
            if (nv > bv) bv = nv;
          }
          nxt[ui] = bv < 0.02 ? 0 : bv;
        }
        tact = nxt;
        for (var ei = 0; ei < N; ei++) {
          var nb2 = decor.tneighbors[ei];
          for (var ej = 0; ej < nb2.length; ej++) {
            var k2 = nb2[ej]; if (k2 < ei) continue;
            var ae = tact[ei] || 0, ak = tact[k2] || 0, act = Math.max(ae, ak), fired = act > 0.06;
            ctx.strokeStyle = fired ? COL.accent2 : COL.line;
            ctx.lineWidth = fired ? 1 + act * 0.55 : 1;
            ctx.globalAlpha = e * (0.05 + act * 0.4);
            ctx.beginPath(); ctx.moveTo(parts[ei].x, parts[ei].y); ctx.lineTo(parts[k2].x, parts[k2].y); ctx.stroke();
            if (act > 0.16) {
              var hi = ae >= ak, sx = hi ? parts[ei].x : parts[k2].x, sy = hi ? parts[ei].y : parts[k2].y;
              var dxp = (hi ? parts[k2].x : parts[ei].x) - sx, dyp = (hi ? parts[k2].y : parts[ei].y) - sy;
              var eseed = ((ei * 73 + k2 * 131) % 97) / 97, fr = (time * 1.0 + eseed) % 1, env = Math.sin(fr * Math.PI);
              ctx.globalAlpha = e * act * env * 0.9; ctx.fillStyle = COL.accent2;
              ctx.beginPath(); ctx.arc(sx + dxp * fr, sy + dyp * fr, 1.3 + act * 1.4, 0, 6.2832); ctx.fill();
            }
          }
        }
        ctx.lineWidth = 1; ctx.globalAlpha = 1;
      } else if (decor.rings) {
        ctx.strokeStyle = COL.line; ctx.globalAlpha = e * 0.5;
        decor.rings.forEach(function (rr) {
          ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.84, 0, 0, 6.2832); ctx.stroke();
        });
      }
      ctx.restore();

      var pcol = mode === "luna" ? COL.luna : COL.accent2;
      parts.forEach(function (q, qi) {
        var bx, by;
        if (mode === "trident") {
          var angT = time * 0.05, oxT = q.tx - cx, oyT = q.ty - cy, caT = Math.cos(angT), saT = Math.sin(angT);
          bx = cx + oxT * caT - oyT * saT; by = cy + oxT * saT + oyT * caT;
        } else {
          var rd = (q.ring % 2 === 0) ? 1 : -1;
          var angL = time * (0.03 + (q.ring || 0) * 0.018) * rd;
          var oxL = q.tx - cx, oyL = q.ty - cy, caL = Math.cos(angL), saL = Math.sin(angL);
          bx = cx + oxL * caL - oyL * saL; by = cy + oxL * saL + oyL * caL;
        }
        if (hov) {
          var dx = bx - mx, dy = by - my, d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (mode === "luna") {
            var rl = R * 0.55;
            if (d < rl) { var f3 = (1 - d / rl); f3 = f3 * f3 * 0.6; bx -= dx * f3; by -= dy * f3; }
          }
        }
        q.x += (bx - q.x) * (0.08 + 0.12 * morph);
        q.y += (by - q.y) * (0.08 + 0.12 * morph);

        var col = pcol, rad = q.r + e * 0.7, alpha = 0.45 + 0.5 * e, bright = 1;
        if (mode === "trident" && (tact[qi] || 0) > 0.05) {
          var ta = tact[qi];
          alpha = Math.min(1, alpha + ta * 0.42); rad += ta * 1.6; col = COL.accent2; bright = 1 + ta * 0.7;
        }
        if (mode === "luna" && hov) {
          var dlu = Math.sqrt((q.x - mx) * (q.x - mx) + (q.y - my) * (q.y - my));
          var b2 = Math.max(0, 1 - dlu / (R * 0.5));
          alpha = Math.min(1, alpha + b2 * 0.5); rad += b2 * 1.6; bright = 1 + b2 * 0.4;
        }

        var pulse = 0.55 + 0.45 * Math.sin(time * 2 + q.ph);
        ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 6.2832);
        ctx.fillStyle = col;
        ctx.globalAlpha = Math.min(1, alpha * (0.85 + 0.15 * pulse));
        if (SFX) { ctx.shadowBlur = 6 * pulse * e * bright; ctx.shadowColor = col; }
        ctx.fill();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });
    }

    var t0 = performance.now();
    function onFrame(now) {
      morph = Math.min(1, morph + Math.min(0.05, (now - t0) / 1000) * 1.6);
      t0 = now;
      render(now);
    }

    function boot() {
      layout();
      if (!W || !H) { requestAnimationFrame(boot); return; }
      if (REDUCED) { morph = 1; render(performance.now()); return; }
      if (window.DamarosAnim) DamarosAnim.loop({ root: canvas, onFrame: onFrame }).start();
      else (function spin(now) { onFrame(now); requestAnimationFrame(spin); })(performance.now());
    }

    var rt, roT;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { layout.done = false; layout(); }, 150);
    });
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        clearTimeout(roT);
        roT = setTimeout(function () { layout.done = false; layout(); }, 80);
      }).observe(canvas);
    }
    boot();
  }

  canvases.forEach(make);
})();
