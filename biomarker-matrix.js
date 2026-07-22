/**
 * Matrix-style biomarker waterfall for hero / close.
 *
 * Max 7 constant-speed trails of oncogenes / tumor-suppressor genes / biomarkers
 * in CTA blue. Close section stays idle until it enters view, then boots all
 * trails at once. Drum contact or pointer tap/hover shatters glyphs into pixels
 * and instantly respawns elsewhere (whack-a-mole).
 */
(function () {
  // Oncogenes, tumor-suppressor genes, fusions, mutations, clinical biomarkers.
  var MARKERS = [
    "EGFR", "KRAS", "NRAS", "HRAS", "BRAF", "MET", "ALK", "ROS1", "RET",
    "NTRK1", "NTRK2", "NTRK3", "ERBB2", "HER2", "PIK3CA", "AKT1", "MYC",
    "MYCN", "CCND1", "CDK4", "CDK6", "MDM2", "FGFR1", "FGFR2", "FGFR3",
    "KIT", "PDGFRA", "FLT3", "JAK2", "ABL1", "BCR-ABL", "IDH1", "IDH2",
    "EZH2", "SMO", "GNAQ", "GNA11", "MPL", "CALR", "ESR1", "AR",
    "TP53", "RB1", "PTEN", "APC", "VHL", "NF1", "NF2", "STK11", "LKB1",
    "CDKN2A", "SMAD4", "BRCA1", "BRCA2", "PALB2", "ATM", "CHEK2", "MLH1",
    "MSH2", "MSH6", "PMS2", "MEN1", "TSC1", "TSC2", "WT1", "DCC", "FBXW7",
    "KEAP1", "ARID1A", "SMARCB1", "MTAP",
    "PD-L1", "PD-1", "MSI-H", "MSS", "dMMR", "pMMR", "TMB-H", "HRD",
    "T790M", "C797S", "G12C", "G12D", "G12V", "L858R", "exon19del",
    "V600E", "V600K", "G719X", "L861Q", "S768I", "exon20ins",
    "ECOG-0", "ECOG-1", "RECIST", "Ki-67", "ER+", "PR+", "HR+",
    "CA-125", "CEA", "AFP", "PSA", "LDH", "β2M", "CTC",
    "HLA-A2", "IHC-3+", "FISH+", "NGS", "ctDNA", "GEP",
    "CD19", "CD20", "CD22", "CD30", "CD33", "BCMA", "GD2",
    "FRα", "TROP2", "Nectin-4", "DLL3", "CLDN18.2", "B7-H3"
  ];

  var BLUE = "61,114,168"; // CTA blue #3d72a8
  var VIS = 1.13;
  var MAX_STREAMS = 7;
  var HEAD_BAND = 5;       // first ~5 glyphs stay stronger
  var SPEED_ROWS = 3.0;
  var GLITCH = 0.14;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var instances = [];
  var raf = 0;

  function pick() { return MARKERS[(Math.random() * MARKERS.length) | 0]; }
  function now() { return (performance && performance.now) ? performance.now() : Date.now(); }

  function destroy(inst, index) {
    makeDebris(inst, inst.streams[index]);
    inst.streams.splice(index, 1);
    // Whack-a-mole: one kill → up to two fresh trails (still capped at MAX_STREAMS).
    if (inst.armed) {
      spawn(inst);
      spawn(inst);
      ensureField(inst); // never allow an empty field while armed
    }
  }

  // Hard invariant: while armed/in-view, trails are never zero — fill to MAX.
  function ensureField(inst) {
    if (!inst.armed || reduced) return;
    if (inst.streams.length === 0) {
      bootStreams(inst);
      return;
    }
    while (inst.streams.length < MAX_STREAMS) spawn(inst);
  }

  function makeDebris(inst, s) {
    var head = s.points[s.points.length - 1];
    var n = trailCount(inst, head ? head.y : 0);
    ensureTokens(s, n);
    // Shatter the brighter head band (+ a bit of the fade) — not the whole column.
    var shatterN = Math.min(n, HEAD_BAND + 3);
    var pts = trailPoints(s.points, shatterN, inst.rowH);
    for (var i = 0; i < pts.length; i++) {
      var y = pts[i].y;
      if (y < -inst.rowH || y > inst.h + inst.rowH) continue;
      var gw = Math.max(inst.fontPx, s.tokens[i].length * inst.fontPx * 0.58);
      var gh = inst.fontPx;
      var count = 6 + ((alphaFor(i) * 18) | 0);
      for (var k = 0; k < count; k++) {
        var ox = (Math.random() - 0.5) * gw;
        var oy = (Math.random() - 0.5) * gh;
        var ang = Math.atan2(oy, ox || 0.001) + (Math.random() - 0.5) * 0.9;
        var sp = 55 + Math.random() * 140;
        inst.debris.push({
          x: pts[i].x + ox, y: y + oy,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          size: 1.5 + Math.random() * 2.0,
          life: 1, ttl: 0.26 + Math.random() * 0.3
        });
      }
    }
  }

  // Glyph count from the head back up past the top of the canvas.
  function trailCount(inst, headY) {
    return Math.max(HEAD_BAND + 2, Math.ceil((headY + inst.rowH * 3) / inst.rowH) + 1);
  }

  function ensureTokens(s, n) {
    while (s.tokens.length < n) s.tokens.push(pick());
  }

  function freeCol(inst) {
    if (!inst.streams.length) return (Math.random() * inst.nCols) | 0;
    var bestCol = 0, bestDist = -1;
    for (var c = 0; c < inst.nCols; c++) {
      var occupied = false, minD = inst.nCols;
      for (var i = 0; i < inst.streams.length; i++) {
        var d = Math.abs(inst.streams[i].col - c);
        if (d === 0) { occupied = true; break; }
        if (d < minD) minD = d;
      }
      if (occupied) continue;
      var score = minD + Math.random() * 0.5;
      if (score > bestDist) { bestDist = score; bestCol = c; }
    }
    return bestCol;
  }

  function spawn(inst, staggerIdx) {
    if (inst.streams.length >= MAX_STREAMS) return;
    var col = freeCol(inst);
    var tokens = [];
    // Preload a full-column of tokens so the trail can stretch from the top.
    var preload = Math.ceil(inst.h / inst.rowH) + 8;
    for (var i = 0; i < preload; i++) tokens.push(pick());
    var x = (col + 0.5) * inst.colW;
    var lead = staggerIdx == null
      ? (2 + Math.random() * 4)
      : (1.2 + staggerIdx * (inst.h / (inst.rowH * (MAX_STREAMS + 1))) + Math.random() * 1.2);
    var y = -inst.rowH * lead;
    inst.streams.push({
      col: col, x: x,
      vx: 0, vy: inst.speed,
      points: [{ x: x, y: y }],
      tokens: tokens,
      state: "fall",
      life: 1
    });
  }

  // Instant full field — used when close section enters view.
  function bootStreams(inst) {
    inst.streams.length = 0;
    for (var i = 0; i < MAX_STREAMS; i++) spawn(inst, i);
    inst.nextSpawn = now() + 400;
  }

  function clearLive(inst) {
    inst.streams.length = 0;
    inst.debris.length = 0;
    if (inst.ctx && inst.w) inst.ctx.clearRect(0, 0, inst.w, inst.h);
  }

  // Sync close section to viewport immediately (don't wait on IO alone).
  function syncVisibility(inst) {
    if (!inst.waitView || reduced) return;
    var r = inst.el.getBoundingClientRect();
    var inView = r.bottom > 48 && r.top < window.innerHeight - 24;
    if (inView) {
      if (!inst.armed) {
        inst.armed = true;
        bootStreams(inst);
      } else {
        ensureField(inst);
      }
    } else if (inst.armed) {
      inst.armed = false;
      clearLive(inst);
      inst.last = 0;
    }
  }

  function watchView(inst) {
    if (inst.io) return;
    if (typeof IntersectionObserver === "undefined") {
      syncVisibility(inst);
      if (!inst.waitView) {
        inst.armed = true;
        ensureField(inst);
      }
      return;
    }
    inst.io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var en = entries[i];
        if (en.isIntersecting) {
          if (!inst.armed) {
            inst.armed = true;
            bootStreams(inst);
            kick();
          } else {
            ensureField(inst);
          }
        } else if (inst.waitView) {
          inst.armed = false;
          clearLive(inst);
          inst.last = 0;
        }
      }
    }, { threshold: 0.08, rootMargin: "80px 0px" });
    inst.io.observe(inst.el);
    // Immediate check so a already-visible close never boots empty.
    syncVisibility(inst);
  }

  function mount(el) {
    if (!el || el.__dmMatrix) return null;
    var canvas = document.createElement("canvas");
    canvas.className = "dm-matrix-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;
    var section = el.closest ? el.closest("section") : null;
    var waitView = el.classList.contains("dm-matrix--close");

    var inst = {
      el: el, canvas: canvas, ctx: ctx,
      mark: section ? section.querySelector(".dm-hero-mark") : null,
      drumSvg: null, drumPaths: null,
      streams: [], debris: [],
      nCols: 0, colW: 0, rowH: 0, rows: 0, speed: 0, fontPx: 12,
      nextSpawn: 0, w: 0, h: 0, dpr: 1, last: 0,
      waitView: waitView,
      armed: !waitView,
      io: null
    };
    el.__dmMatrix = inst;
    resize(inst);
    bindDrum(inst);
    watchView(inst);
    if (!waitView && !reduced) ensureField(inst);
    if (reduced) paintStatic(inst);
    return inst;
  }

  function resize(inst) {
    var r = inst.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.floor(r.width));
    var h = Math.max(1, Math.floor(r.height));
    if (w === inst.w && h === inst.h && dpr === inst.dpr) return;

    inst.w = w; inst.h = h; inst.dpr = dpr;
    inst.canvas.width = Math.floor(w * dpr);
    inst.canvas.height = Math.floor(h * dpr);
    inst.canvas.style.width = w + "px";
    inst.canvas.style.height = h + "px";
    inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Tighter columns on phone so spacing still reads; roomier on desktop.
    var target = w < 480 ? 48 : w < 900 ? 58 : 72;
    inst.nCols = Math.max(6, Math.round(w / target));
    inst.rowH = w < 480 ? 16 : w < 900 ? 18 : 20;
    inst.colW = w / inst.nCols;
    inst.rows = Math.max(8, Math.ceil(h / inst.rowH) + 2);
    inst.speed = inst.rowH * SPEED_ROWS;
    inst.fontPx = Math.max(9, Math.floor(inst.rowH * 0.6));
    inst.streams.length = 0;
    inst.debris.length = 0;
    inst.nextSpawn = 0;
    if (inst.armed && !reduced) bootStreams(inst);
    bindDrum(inst);
  }

  // Bind to the live SVG drum paths (arcs + stroke-width + CSS dmDrift).
  function bindDrum(inst) {
    var mark = inst.mark;
    if (!mark || !mark.isConnected) {
      inst.drumSvg = null;
      inst.drumPaths = null;
      return;
    }
    var svg = mark.querySelector("svg");
    if (!svg) {
      inst.drumSvg = null;
      inst.drumPaths = null;
      return;
    }
    inst.drumSvg = svg;
    inst.drumPaths = svg.querySelectorAll("path");
  }

  // True if client (screen) point sits on any painted drum stroke pixel.
  function strokeAtClient(inst, clientX, clientY) {
    var svg = inst.drumSvg, paths = inst.drumPaths;
    if (!svg || !paths || !paths.length) return false;
    if (typeof paths[0].isPointInStroke !== "function") return false;
    var pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var ctm = path.getScreenCTM();
      if (!ctm) continue;
      var local = pt.matrixTransform(ctm.inverse());
      if (path.isPointInStroke(local)) return true;
    }
    return false;
  }

  // Sample the head's motion + glyph footprint against the live stroked drum.
  // Returns the first canvas-space contact point, or null.
  function drumHit(inst, x0, y0, x1, y1) {
    if (!inst.drumPaths || !inst.drumPaths.length) bindDrum(inst);
    if (!inst.drumPaths || !inst.drumPaths.length) return null;
    if (typeof inst.drumPaths[0].isPointInStroke !== "function") return null;

    var cr = inst.canvas.getBoundingClientRect();
    var dist = Math.hypot(x1 - x0, y1 - y0);
    // Dense samples so fast frames can't skip over the ~stroke-width band.
    var steps = Math.max(6, Math.ceil(dist / 1.5));
    // Glyph footprint: text is centered on the head with middle baseline.
    var hx = Math.max(3, inst.fontPx * 0.55);
    var hy = Math.max(2, inst.fontPx * 0.4);
    var offsets = [
      [0, 0], [0, hy], [0, -hy],
      [-hx, 0], [hx, 0],
      [-hx * 0.7, hy * 0.7], [hx * 0.7, hy * 0.7]
    ];

    for (var s = 0; s <= steps; s++) {
      var t = s / steps;
      var cx = x0 + (x1 - x0) * t;
      var cy = y0 + (y1 - y0) * t;
      for (var o = 0; o < offsets.length; o++) {
        var px = cx + offsets[o][0];
        var py = cy + offsets[o][1];
        if (strokeAtClient(inst, cr.left + px, cr.top + py)) {
          return { x: cx, y: cy };
        }
      }
    }
    return null;
  }

  function trailPoints(points, count, spacing) {
    var last = points.length - 1;
    var res = [{ x: points[last].x, y: points[last].y }];
    var target = spacing, dist = 0;
    for (var i = last; i > 0 && res.length < count; i--) {
      var ax = points[i].x, ay = points[i].y;
      var bx = points[i - 1].x, by = points[i - 1].y;
      var dx = ax - bx, dy = ay - by;
      var seg = Math.hypot(dx, dy);
      if (seg === 0) continue;
      while (dist + seg >= target && res.length < count) {
        var t = (target - dist) / seg;
        res.push({ x: ax - dx * t, y: ay - dy * t });
        target += spacing;
      }
      dist += seg;
    }
    // Extend straight up so the column always reaches the top of the canvas.
    while (res.length < count) {
      var tip = res[res.length - 1];
      res.push({ x: tip.x, y: tip.y - spacing });
    }
    return res;
  }

  // Head band stays solid; past ~5 glyphs the column keeps going with a soft fade.
  function alphaFor(i) {
    var a;
    if (i === 0) a = 0.58;
    else if (i < HEAD_BAND) a = 0.52 - i * 0.035; // ~0.52 → ~0.38
    else {
      // Long, subtle wash back toward the top of the page.
      var t = (i - HEAD_BAND) / 18;
      a = Math.max(0.035, 0.28 * Math.exp(-t * 1.15));
    }
    return a * VIS;
  }

  function drawStream(ctx, inst, s) {
    var head = s.points[s.points.length - 1];
    var n = trailCount(inst, head.y);
    ensureTokens(s, n);
    var pts = trailPoints(s.points, n, inst.rowH);
    if (Math.random() < GLITCH) s.tokens[(Math.random() * s.tokens.length) | 0] = pick();
    for (var i = 0; i < pts.length; i++) {
      var y = pts[i].y;
      if (y < -inst.rowH || y > inst.h + inst.rowH) continue;
      var a = alphaFor(i);
      if (a < 0.02) continue;
      var glitch = Math.random() < 0.03;
      ctx.fillStyle = glitch
        ? "rgba(150,190,232," + Math.min(0.9, a * 2.4).toFixed(3) + ")"
        : "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      ctx.fillText(s.tokens[i % s.tokens.length], pts[i].x, y);
    }
  }

  function drawDebris(ctx, inst, secs) {
    var d = inst.debris;
    for (var e = d.length - 1; e >= 0; e--) {
      var p = d[e];
      p.x += p.vx * secs;
      p.y += p.vy * secs;
      p.life -= secs / p.ttl;
      if (p.life <= 0 || p.x < -20 || p.x > inst.w + 20 || p.y < -20 || p.y > inst.h + 20) {
        d.splice(e, 1);
        continue;
      }
      var a = p.life * 0.7 * VIS;
      var flash = Math.random() < 0.18;
      ctx.fillStyle = flash
        ? "rgba(170,205,240," + Math.min(0.95, a * 1.9).toFixed(3) + ")"
        : "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      var sz = p.size * (0.35 + p.life * 0.65);
      ctx.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
    }
  }

  function paintStatic(inst) {
    var ctx = inst.ctx;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var step = Math.max(1, Math.floor(inst.nCols / MAX_STREAMS));
    for (var c = 0; c < inst.nCols; c += step) {
      var x = (c + 0.5) * inst.colW;
      for (var r = 0; r < inst.rows; r++) {
        if ((r + c) % 2 !== 0) continue;
        ctx.fillStyle = "rgba(" + BLUE + "," + (0.12 + ((r + c) % 4) * 0.03).toFixed(3) + ")";
        ctx.fillText(pick(), x, r * inst.rowH + inst.rowH * 0.5);
      }
    }
  }

  function paint(inst, dt) {
    if (!inst.armed) return;
    ensureField(inst); // never paint an empty field
    var ctx = inst.ctx, secs = dt / 1000;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    if (!inst.drumPaths || !inst.drumPaths.length) bindDrum(inst);

    // Keep enough path history to draw a column stretching back past the top.
    var maxPathLen = inst.h + inst.rowH * 6;

    for (var i = inst.streams.length - 1; i >= 0; i--) {
      var s = inst.streams[i];
      var last = s.points[s.points.length - 1];
      var nx = last.x + s.vx * secs;
      var ny = last.y + s.vy * secs;

      var hit = drumHit(inst, last.x, last.y, nx, ny);
      if (hit) {
        s.points.push({ x: hit.x, y: hit.y });
        destroy(inst, i);
        continue;
      }

      s.points.push({ x: nx, y: ny });

      var lenAcc = 0, keepFrom = 0;
      for (var k = s.points.length - 1; k > 0; k--) {
        lenAcc += Math.hypot(s.points[k].x - s.points[k - 1].x, s.points[k].y - s.points[k - 1].y);
        if (lenAcc > maxPathLen) { keepFrom = k - 1; break; }
      }
      if (keepFrom > 0) s.points.splice(0, keepFrom);

      // Leave once the head (and its bright band) have cleared the bottom.
      if (ny - HEAD_BAND * inst.rowH > inst.h) {
        inst.streams.splice(i, 1);
        spawn(inst);
        spawn(inst);
        ensureField(inst);
        continue;
      }

      drawStream(ctx, inst, s);
    }

    ensureField(inst); // refill after any removals this frame
    drawDebris(ctx, inst, secs);
  }

  function tick(ts) {
    raf = 0;
    var any = false;
    for (var i = 0; i < instances.length; i++) {
      var inst = instances[i];
      if (!inst.el.isConnected) continue;
      syncVisibility(inst);
      if (!inst.armed) continue;
      var r = inst.el.getBoundingClientRect();
      if (r.bottom <= -20 || r.top >= window.innerHeight + 20) { inst.last = 0; continue; }
      any = true;
      var dt = inst.last ? Math.min(48, ts - inst.last) : 16;
      inst.last = ts;
      paint(inst, dt);
    }
    if (any && !reduced) raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (reduced || raf) return;
    raf = requestAnimationFrame(tick);
  }

  function collect() {
    var nodes = document.querySelectorAll(".dm-matrix");
    var next = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var inst = el.__dmMatrix || mount(el);
      if (inst) { resize(inst); next.push(inst); }
    }
    instances = next;
    return instances.length > 0;
  }

  // Hover (mouse) or tap (touch/pen) shatters a trail — larger hit on coarse pointers.
  function breakAt(clientX, clientY, pointerType) {
    if (reduced) return;
    var touchy = pointerType === "touch" || coarse;
    for (var i = 0; i < instances.length; i++) {
      var inst = instances[i];
      if (!inst.el.isConnected || !inst.armed) continue;
      var cr = inst.canvas.getBoundingClientRect();
      var x = clientX - cr.left, y = clientY - cr.top;
      if (x < 0 || y < 0 || x > inst.w || y > inst.h) continue;
      var thr = inst.rowH * (touchy ? 2.0 : 1.3);
      var thr2 = thr * thr;
      for (var s = inst.streams.length - 1; s >= 0; s--) {
        var st = inst.streams[s];
        var head = st.points[st.points.length - 1];
        var n = Math.min(trailCount(inst, head ? head.y : 0), HEAD_BAND + 4);
        var pts = trailPoints(st.points, n, inst.rowH);
        for (var p = 0; p < pts.length; p++) {
          var dx = pts[p].x - x, dy = pts[p].y - y;
          if (dx * dx + dy * dy <= thr2) { destroy(inst, s); break; }
        }
      }
    }
    kick();
  }

  // Mouse hover breaks trails; touch only breaks on tap (not scroll-drag).
  function onPointerMove(e) {
    if (e.pointerType === "touch") return;
    breakAt(e.clientX, e.clientY, e.pointerType);
  }
  function onPointerDown(e) {
    breakAt(e.clientX, e.clientY, e.pointerType);
  }

  function boot() {
    if (!collect()) return;
    if (reduced) {
      for (var i = 0; i < instances.length; i++) paintStatic(instances[i]);
      return;
    }
    kick();
  }

  window.addEventListener("scroll", kick, { passive: true });
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("resize", function () {
    for (var i = 0; i < instances.length; i++) resize(instances[i]);
    if (reduced) {
      for (var j = 0; j < instances.length; j++) paintStatic(instances[j]);
    } else {
      kick();
    }
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", boot);

  var tries = 0;
  var poll = setInterval(function () {
    tries += 1;
    var ok = collect();
    if (ok) {
      if (reduced) { for (var i = 0; i < instances.length; i++) paintStatic(instances[i]); }
      else kick();
    }
    if (ok && tries > 8) clearInterval(poll);
    if (tries > 40) clearInterval(poll);
  }, 250);
})();
