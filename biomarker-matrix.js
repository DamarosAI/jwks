/**
 * Matrix-style biomarker waterfall for hero / close.
 *
 * A small pool of streams (max 7 at once) of oncogenes, tumor-suppressor
 * genes, and clinical biomarkers falls in CTA blue at a single constant speed.
 * When a stream reaches the Damaros drum mark it reflects off the drum's actual
 * edge normal (accurate to the drum's angle) and its trail smoothly bends along
 * the deflection while fading out — no acceleration anywhere. Infinite, random.
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
  var VIS = 1.13;          // ~13% more visible than the earlier pass
  var MAX_STREAMS = 7;     // never more than 7 trails at once
  var TRAIL = 6;           // glyphs per trail
  var SPEED_ROWS = 3.0;    // constant fall speed, in rows/sec (no acceleration)
  var GLITCH = 0.14;       // per-stream chance/frame to swap a glyph (retro flicker)
  var EVAP_TTL = 0.9;      // seconds a deflected trail takes to evaporate

  // Drum outline in SVG viewBox (0 0 476 520) coords. Arcs approximated by
  // their chords — the corners are small radii, so the edge angles are exact.
  var DRUM_PATHS = [
    [[104.82, 74.5], [366.46, 74.5], [402.59, 133.29], [368.99, 199.68],
     [312.33, 234.5], [158.12, 234.5], [101.18, 199.11], [68.5, 132.93]],
    [[158.62, 284.5], [312.06, 284.5], [368.75, 319.39], [403.25, 387.75],
     [367.09, 446.5], [104.32, 446.5], [68.01, 388.07], [101.68, 319.88]]
  ];

  // Edges with outward unit normals in view coords (uniform scaling preserves
  // normal direction, so only vertices are transformed per frame).
  var DRUM_EDGES = buildEdges();

  function buildEdges() {
    var edges = [];
    for (var p = 0; p < DRUM_PATHS.length; p++) {
      var poly = DRUM_PATHS[p];
      var cx = 0, cy = 0;
      for (var i = 0; i < poly.length; i++) { cx += poly[i][0]; cy += poly[i][1]; }
      cx /= poly.length; cy /= poly.length;
      for (var j = 0; j < poly.length; j++) {
        var a = poly[j];
        var b = poly[(j + 1) % poly.length];
        var dx = b[0] - a[0], dy = b[1] - a[1];
        var len = Math.hypot(dx, dy) || 1;
        var nx = dy / len, ny = -dx / len;
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
        edges.push({ ax: a[0], ay: a[1], bx: b[0], by: b[1], nx: nx, ny: ny });
      }
    }
    return edges;
  }

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var instances = [];
  var raf = 0;

  function pick() { return MARKERS[(Math.random() * MARKERS.length) | 0]; }
  function now() { return (performance && performance.now) ? performance.now() : Date.now(); }

  // Pick the column that is as far as possible from every active trail, so the
  // (max 7) streams stay cleanly spread across the width.
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
      // Tiny jitter breaks ties without collapsing the spacing.
      var score = minD + Math.random() * 0.5;
      if (score > bestDist) { bestDist = score; bestCol = c; }
    }
    return bestCol;
  }

  function spawn(inst) {
    var col = freeCol(inst);
    var tokens = [];
    for (var i = 0; i < TRAIL; i++) tokens.push(pick());
    var x = (col + 0.5) * inst.colW;
    var y = -inst.rowH * (2 + Math.random() * 4); // ease in from above the top
    inst.streams.push({
      col: col, x: x,
      vx: 0, vy: inst.speed,
      points: [{ x: x, y: y }],
      tokens: tokens,
      state: "fall",
      life: 1
    });
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

    var inst = {
      el: el, canvas: canvas, ctx: ctx,
      mark: section ? section.querySelector(".dm-hero-mark") : null,
      streams: [],
      nCols: 0, colW: 0, rowH: 0, rows: 0, speed: 0, fontPx: 12,
      nextSpawn: 0, w: 0, h: 0, dpr: 1, last: 0
    };
    el.__dmMatrix = inst;
    resize(inst);
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

    var target = w < 640 ? 58 : 72;
    inst.nCols = Math.max(6, Math.round(w / target));
    inst.rowH = w < 640 ? 18 : 20;
    inst.colW = w / inst.nCols;
    inst.rows = Math.max(8, Math.ceil(h / inst.rowH) + 2);
    inst.speed = inst.rowH * SPEED_ROWS;
    inst.fontPx = Math.max(10, Math.floor(inst.rowH * 0.6));
    inst.streams.length = 0;
    inst.nextSpawn = 0;
  }

  // Current drum transform (view → canvas): { scale, ox, oy } or null.
  function drumFor(inst) {
    var mark = inst.mark;
    if (!mark || !mark.isConnected) return null;
    var cr = inst.canvas.getBoundingClientRect();
    var mr = mark.getBoundingClientRect();
    if (!mr.width || !mr.height) return null;
    var scale = Math.min(mr.width / 476, mr.height / 520); // xMidYMid meet
    var dw = 476 * scale, dh = 520 * scale;
    return {
      scale: scale,
      ox: (mr.left - cr.left) + (mr.width - dw) / 2,
      oy: (mr.top - cr.top) + (mr.height - dh) / 2
    };
  }

  // First contact of a moving head, segment (x0,y0)->(x1,y1), with a top-facing
  // drum edge. Returns { x, y, nx, ny } or null.
  function drumHit(drum, x0, y0, x1, y1) {
    if (!drum) return null;
    var best = null, bestT = 2;
    for (var i = 0; i < DRUM_EDGES.length; i++) {
      var e = DRUM_EDGES[i];
      // Only surfaces facing against the motion can be struck.
      var mvx = x1 - x0, mvy = y1 - y0;
      if (mvx * e.nx + mvy * e.ny >= 0) continue;
      var ax = drum.ox + e.ax * drum.scale, ay = drum.oy + e.ay * drum.scale;
      var bx = drum.ox + e.bx * drum.scale, by = drum.oy + e.by * drum.scale;
      var ex = bx - ax, ey = by - ay;
      var denom = mvx * ey - mvy * ex;
      if (denom === 0) continue;
      var t = ((ax - x0) * ey - (ay - y0) * ex) / denom; // along motion
      var u = ((ax - x0) * mvy - (ay - y0) * mvx) / denom; // along edge
      if (t < 0 || t > 1 || u < 0 || u > 1) continue;
      if (t < bestT) {
        bestT = t;
        best = { x: x0 + mvx * t, y: y0 + mvy * t, nx: e.nx, ny: e.ny };
      }
    }
    return best;
  }

  // Even glyph spacing along the head's path (newest point last).
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
    return res;
  }

  // Smooth head-to-tail falloff (eased, not stepped).
  function alphaFor(i, total) {
    var f = i / (total - 1 || 1);        // 0 head → 1 tail
    var a = (1 - f) * (1 - f);           // quadratic ease-out
    a = 0.08 + a * 0.44;                 // tail floor .08, head .52
    return a * VIS;
  }

  function drawStream(ctx, inst, s) {
    var pts = trailPoints(s.points, TRAIL, inst.rowH);
    var fade = s.state === "evap" ? Math.max(0, s.life) : 1;

    // Retro-glitch: swap a random glyph now and then so tokens churn.
    if (Math.random() < GLITCH) s.tokens[(Math.random() * TRAIL) | 0] = pick();

    for (var i = 0; i < pts.length; i++) {
      var y = pts[i].y;
      if (y < -inst.rowH || y > inst.h + inst.rowH) continue;
      var a = alphaFor(i, TRAIL) * fade;
      if (a < 0.01) continue;
      // Occasional bright flash on a glyph — CRT-style flicker.
      var glitch = Math.random() < 0.03;
      ctx.fillStyle = glitch
        ? "rgba(150,190,232," + Math.min(0.9, a * 2.4).toFixed(3) + ")"
        : "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      ctx.fillText(s.tokens[i], pts[i].x, y);
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
    var ctx = inst.ctx, secs = dt / 1000;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    var drum = drumFor(inst);
    var t = now();

    // Keep up to MAX_STREAMS trails alive, staggered so it stays fluid.
    if (inst.streams.length < MAX_STREAMS && t >= inst.nextSpawn) {
      spawn(inst);
      inst.nextSpawn = t + 380 + Math.random() * 340;
    }

    var maxPathLen = TRAIL * inst.rowH + inst.rowH * 2;

    for (var i = inst.streams.length - 1; i >= 0; i--) {
      var s = inst.streams[i];
      var last = s.points[s.points.length - 1];
      var nx = last.x + s.vx * secs;
      var ny = last.y + s.vy * secs;

      if (s.state === "fall") {
        var hit = drumHit(drum, last.x, last.y, nx, ny);
        if (hit) {
          // Reflect at constant speed — direction changes, magnitude does not.
          var dot = s.vx * hit.nx + s.vy * hit.ny;
          var rx = s.vx - 2 * dot * hit.nx;
          var ry = s.vy - 2 * dot * hit.ny;
          var rl = Math.hypot(rx, ry) || 1;
          s.vx = (rx / rl) * inst.speed;
          s.vy = (ry / rl) * inst.speed;
          s.points.push({ x: hit.x, y: hit.y });
          s.state = "evap";
          nx = hit.x; ny = hit.y;
        }
      }

      s.points.push({ x: nx, y: ny });

      // Trim the stored path to what the trail needs.
      var lenAcc = 0, keepFrom = 0;
      for (var k = s.points.length - 1; k > 0; k--) {
        lenAcc += Math.hypot(s.points[k].x - s.points[k - 1].x, s.points[k].y - s.points[k - 1].y);
        if (lenAcc > maxPathLen) { keepFrom = k - 1; break; }
      }
      if (keepFrom > 0) s.points.splice(0, keepFrom);

      if (s.state === "evap") {
        s.life -= secs / EVAP_TTL;
        if (s.life <= 0) { inst.streams.splice(i, 1); continue; }
      } else if (ny - TRAIL * inst.rowH > inst.h) {
        inst.streams.splice(i, 1); // fell past the bottom
        continue;
      }

      drawStream(ctx, inst, s);
    }
  }

  function tick(ts) {
    raf = 0;
    var any = false;
    for (var i = 0; i < instances.length; i++) {
      var inst = instances[i];
      if (!inst.el.isConnected) continue;
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

  function boot() {
    if (!collect()) return;
    if (reduced) {
      for (var i = 0; i < instances.length; i++) paintStatic(instances[i]);
      return;
    }
    kick();
  }

  window.addEventListener("scroll", kick, { passive: true });
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

  // DC remounts template content — rebind when .dm-matrix appears.
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
