/**
 * Matrix-style biomarker waterfall for hero / close.
 *
 * Grid-aligned columns of oncogenes, tumor-suppressor genes, and clinical
 * biomarkers fall in CTA blue. When a stream reaches the Damaros drum mark it
 * reflects off the drum's actual edge normal (accurate to the drum's angle),
 * scatters into a small burst, and evaporates. Infinite and randomized.
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
  var VIS = 1.13; // ~13% more visible than the prior pass
  var GRAVITY = 300; // px/s^2 for the evaporating burst

  // Drum outline in SVG viewBox (0 0 476 520) coords. Arcs approximated by
  // their chords — the corners are small radii, so the edge angles are exact.
  var DRUM_PATHS = [
    [[104.82, 74.5], [366.46, 74.5], [402.59, 133.29], [368.99, 199.68],
     [312.33, 234.5], [158.12, 234.5], [101.18, 199.11], [68.5, 132.93]],
    [[158.62, 284.5], [312.06, 284.5], [368.75, 319.39], [403.25, 387.75],
     [367.09, 446.5], [104.32, 446.5], [68.01, 388.07], [101.68, 319.88]]
  ];

  // Precompute edges with outward unit normals in view coords (uniform scaling
  // preserves normal direction, so we only transform vertices per frame).
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
        var nx = dy / len, ny = -dx / len; // one perpendicular
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; } // point outward
        edges.push({ ax: a[0], ay: a[1], bx: b[0], by: b[1], nx: nx, ny: ny });
      }
    }
    return edges;
  }

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var instances = [];
  var raf = 0;

  function pick() { return MARKERS[(Math.random() * MARKERS.length) | 0]; }

  function newStream(inst, c, seedTop) {
    var trail = 5 + ((Math.random() * 7) | 0);
    var tokens = [];
    for (var i = 0; i < trail; i++) tokens.push(pick());
    var s = inst.streams[c] || {};
    s.x = Math.round((c + 0.5) * inst.colW);
    s.trail = trail;
    s.tokens = tokens;
    s.speed = 95 + Math.random() * 95; // px/s
    s.state = "fall";
    // Stagger starts above the top edge.
    s.y = seedTop
      ? -(Math.random() * inst.h * 0.6) - trail * inst.rowH
      : -trail * inst.rowH - Math.random() * inst.rowH * 4;
    return s;
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
      streams: [], evap: [],
      colW: 0, rowH: 0, rows: 0, fontPx: 12,
      w: 0, h: 0, dpr: 1, last: 0
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
    var nCols = Math.max(4, Math.round(w / target));
    var rowH = w < 640 ? 18 : 20;
    inst.colW = w / nCols;
    inst.rowH = rowH;
    inst.rows = Math.max(8, Math.ceil(h / rowH) + 2);
    inst.fontPx = Math.max(10, Math.floor(rowH * 0.6));
    inst.streams = new Array(nCols);
    for (var i = 0; i < nCols; i++) inst.streams[i] = newStream(inst, i, true);
    inst.evap.length = 0;
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

  // First downward contact of the vertical fall x=[x], y in [y0,y1].
  function drumHit(drum, x, y0, y1) {
    if (!drum || y1 <= y0) return null;
    var best = null;
    for (var i = 0; i < DRUM_EDGES.length; i++) {
      var e = DRUM_EDGES[i];
      if (e.ny >= 0) continue; // only top-facing surfaces catch a falling glyph
      var ax = drum.ox + e.ax * drum.scale, ay = drum.oy + e.ay * drum.scale;
      var bx = drum.ox + e.bx * drum.scale, by = drum.oy + e.by * drum.scale;
      var denom = bx - ax;
      if (denom === 0) continue; // vertical edge, parallel to the fall
      var u = (x - ax) / denom;
      if (u < 0 || u > 1) continue;
      var yInt = ay + u * (by - ay);
      if (yInt < y0 || yInt > y1) continue;
      if (!best || yInt < best.y) best = { x: x, y: yInt, nx: e.nx, ny: e.ny };
    }
    return best;
  }

  function burst(inst, s, hit) {
    var dot = s.speed * hit.ny; // v = (0, speed) downward
    var rx = -2 * dot * hit.nx;
    var ry = s.speed - 2 * dot * hit.ny;
    var rl = Math.hypot(rx, ry) || 1;
    rx /= rl; ry /= rl;
    var base = s.speed * 0.65;
    var n = 4 + ((Math.random() * 3) | 0);
    for (var i = 0; i < n; i++) {
      var ang = (Math.random() - 0.5) * 1.0; // spread around the reflected ray
      var ca = Math.cos(ang), sa = Math.sin(ang);
      var dx = rx * ca - ry * sa;
      var dy = rx * sa + ry * ca;
      var sp = base * (0.5 + Math.random() * 0.9);
      inst.evap.push({
        x: hit.x + (Math.random() - 0.5) * 6,
        y: hit.y + (Math.random() - 0.5) * 6,
        vx: dx * sp, vy: dy * sp,
        token: Math.random() < 0.5 ? s.tokens[0] : pick(),
        life: 1, ttl: 0.55 + Math.random() * 0.55
      });
    }
  }

  function alphaFor(i) {
    var a;
    if (i === 0) a = 0.5;
    else if (i === 1) a = 0.37;
    else a = Math.max(0.06, 0.32 - (i - 1) * 0.05);
    return a * VIS;
  }

  function drawStream(ctx, inst, s) {
    var x = s.x, rowH = inst.rowH;
    for (var i = 0; i < s.trail; i++) {
      var y = s.y - i * rowH;
      if (y < -rowH || y > inst.h + rowH) continue;
      ctx.fillStyle = "rgba(" + BLUE + "," + alphaFor(i).toFixed(3) + ")";
      ctx.fillText(s.tokens[i], x, y);
    }
    if (Math.random() < 0.05) s.tokens[(Math.random() * s.trail) | 0] = pick();
  }

  function paintStatic(inst) {
    var ctx = inst.ctx;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var c = 0; c < inst.streams.length; c++) {
      var x = Math.round((c + 0.5) * inst.colW);
      for (var r = 0; r < inst.rows; r++) {
        if ((r + c) % 2 !== 0) continue;
        ctx.fillStyle = "rgba(" + BLUE + "," + (0.13 + ((r + c) % 4) * 0.03).toFixed(3) + ")";
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
    var now = performance.now ? performance.now() : Date.now();

    for (var c = 0; c < inst.streams.length; c++) {
      var s = inst.streams[c];
      if (s.state === "wait") {
        if (now >= s.respawnAt) inst.streams[c] = newStream(inst, c, false);
        continue;
      }
      var oldY = s.y;
      s.y += s.speed * secs;

      var hit = drumHit(drum, s.x, oldY, s.y);
      if (hit) {
        burst(inst, s, hit);
        s.state = "wait";
        s.respawnAt = now + 250 + Math.random() * 900;
        continue;
      }
      if (s.y - s.trail * inst.rowH > inst.h) {
        inst.streams[c] = newStream(inst, c, false);
        continue;
      }
      drawStream(ctx, inst, s);
    }

    // Evaporating burst particles.
    for (var e = inst.evap.length - 1; e >= 0; e--) {
      var p = inst.evap[e];
      p.vy += GRAVITY * secs;
      p.x += p.vx * secs;
      p.y += p.vy * secs;
      p.life -= secs / p.ttl;
      if (p.life <= 0 || p.y > inst.h + 30 || p.x < -30 || p.x > inst.w + 30) {
        inst.evap.splice(e, 1);
        continue;
      }
      var a = Math.max(0, Math.pow(p.life, 0.85)) * 0.5 * VIS;
      ctx.fillStyle = "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      ctx.fillText(p.token, p.x, p.y);
    }
  }

  function tick(now) {
    raf = 0;
    var any = false;
    for (var i = 0; i < instances.length; i++) {
      var inst = instances[i];
      if (!inst.el.isConnected) continue;
      var r = inst.el.getBoundingClientRect();
      if (r.bottom <= -20 || r.top >= window.innerHeight + 20) { inst.last = 0; continue; }
      any = true;
      var dt = inst.last ? Math.min(48, now - inst.last) : 16;
      inst.last = now;
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
