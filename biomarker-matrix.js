/**
 * Matrix-style biomarker waterfall for hero / close.
 *
 * Trails of oncogenes / tumor-suppressor genes / biomarkers in CTA blue.
 * Trail count is calibrated so 7 looks right on a MacBook Air 15 (~1440×900
 * CSS), then scales with viewport area so larger monitors (e.g. 2160×1440)
 * never look sparse. Each trail holds a constant random speed within a 20%
 * slowest→fastest band; neighboring trails (nearest left/right) never match.
 * First paint seeds a full mid-fall field so load feels like joining a living
 * page. Close stays idle until it enters view, then boots the same way.
 * Hero and close share pass-through exit physics; drum or headline/CTA contact
 * fades the trail smoothly. Hover (desktop) or tap (mobile) still shatters.
 * Glyph swaps are infrequent/time-based so fall stays smooth while scrolling.
 * A quiet CTA-blue session counter (bottom-left on hero + close) tallies
 * trails shattered this page load and resets on refresh. At 100, both drums
 * bounce once on the drift axis, keep a CTA glow, and the count disappears.
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
  // Density lock: 7 trails on MacBook Air 15 logical CSS (~1440×900).
  var REF_W = 1440;
  var REF_H = 900;
  var REF_STREAMS = 7;
  var MIN_STREAMS = 4;
  var MAX_STREAMS_HARD = 24;
  var TRAIL = 6;
  var SPEED_ROWS = 3.0;
  // Max ratio fastest/slowest − 1. Discrete steps make "same speed" meaningful.
  var SPEED_DELTA = 0.20;
  var SPEED_STEPS = 5;
  // Token swaps are time-based (not per-frame) so fall reads smooth, not noisy.
  var GLITCH_GAP_LO = 720;
  var GLITCH_GAP_HI = 1600;

  // Scale trail count with viewport area so density matches the Air 15 look.
  function streamCap(w, h) {
    var area = Math.max(1, w * h);
    var n = Math.round(REF_STREAMS * (area / (REF_W * REF_H)));
    return Math.max(MIN_STREAMS, Math.min(MAX_STREAMS_HARD, n));
  }

  // Speeds of the nearest live trails to the left and right of `col`.
  function neighborSpeedSteps(inst, col) {
    var leftStep = null, rightStep = null, leftDist = Infinity, rightDist = Infinity;
    for (var i = 0; i < inst.streams.length; i++) {
      var s = inst.streams[i];
      if (s.speedStep == null) continue;
      var d = s.col - col;
      if (d < 0 && -d < leftDist) { leftDist = -d; leftStep = s.speedStep; }
      if (d > 0 && d < rightDist) { rightDist = d; rightStep = s.speedStep; }
    }
    return { left: leftStep, right: rightStep };
  }

  // Random speed in [base/√1.2, base·√1.2]; never match a column-adjacent trail.
  function pickSpeed(inst, col) {
    var mid = inst.speed;
    var spread = Math.sqrt(1 + SPEED_DELTA);
    var lo = mid / spread;
    var hi = mid * spread;
    var nbr = neighborSpeedSteps(inst, col);
    var blocked = Object.create(null);
    if (nbr.left != null) blocked[nbr.left] = true;
    if (nbr.right != null) blocked[nbr.right] = true;
    var choices = [];
    for (var k = 0; k < SPEED_STEPS; k++) {
      if (!blocked[k]) choices.push(k);
    }
    if (!choices.length) {
      // All steps blocked (rare); pick farthest from both neighbors.
      var worst = -1, bestStep = 0;
      for (var a = 0; a < SPEED_STEPS; a++) {
        var minDiff = SPEED_STEPS;
        if (nbr.left != null) minDiff = Math.min(minDiff, Math.abs(nbr.left - a));
        if (nbr.right != null) minDiff = Math.min(minDiff, Math.abs(nbr.right - a));
        if (minDiff > worst) { worst = minDiff; bestStep = a; }
      }
      choices = [bestStep];
    }
    var step = choices[(Math.random() * choices.length) | 0];
    var t = SPEED_STEPS <= 1 ? 0.5 : step / (SPEED_STEPS - 1);
    return { vy: lo + (hi - lo) * t, speedStep: step };
  }

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var instances = [];
  var raf = 0;
  // Session shatter tally - resets on refresh; mirrored on hero + close HUDs.
  var sessionBroken = 0;
  var breakHuds = [];
  var breakTickT = 0;
  var celebrated = false;
  var CENTURION_AT = 100;

  function pick() { return MARKERS[(Math.random() * MARKERS.length) | 0]; }
  function now() { return (performance && performance.now) ? performance.now() : Date.now(); }

  function allDrumMarks() {
    return document.querySelectorAll(
      'section[data-screen-label="Hero"] .dm-hero-mark, section[data-screen-label="Close"] .dm-hero-mark, #close .dm-hero-mark'
    );
  }

  function hideBreakHuds() {
    for (var i = 0; i < breakHuds.length; i++) {
      var hud = breakHuds[i];
      if (!hud || !hud.isConnected) continue;
      hud.classList.remove("is-on", "is-tick");
      hud.classList.add("is-gone");
    }
  }

  function celebrateCenturion() {
    if (celebrated) return;
    celebrated = true;
    hideBreakHuds();

    var marks = allDrumMarks();
    for (var i = 0; i < marks.length; i++) {
      var mark = marks[i];
      mark.classList.add("is-centurion");
      if (reduced) continue;
      // Power rotation on the same axis as dmDrift; hand off cleanly when done.
      (function (el) {
        var drift = "dmDrift 18s ease-in-out infinite";
        el.classList.add("is-centurion-bounce");
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          el.classList.remove("is-centurion-bounce");
          el.style.removeProperty("animation");
          // Restore inline drift (style attr still has it; clear override).
          el.style.animation = drift;
          el.removeEventListener("animationend", onEnd);
        }
        function onEnd(e) {
          if (e.animationName && e.animationName !== "dmDrumPower") return;
          finish();
        }
        el.addEventListener("animationend", onEnd);
        setTimeout(finish, 3000);
      })(mark);
    }
  }

  function renderBreakHuds() {
    if (celebrated) {
      hideBreakHuds();
      return;
    }
    var n = String(sessionBroken);
    var on = sessionBroken > 0;
    for (var i = 0; i < breakHuds.length; i++) {
      var hud = breakHuds[i];
      if (!hud || !hud.isConnected) continue;
      hud.setAttribute("data-n", n);
      hud.textContent = n;
      if (on) hud.classList.add("is-on");
      else hud.classList.remove("is-on");
    }
  }

  function bumpBroken() {
    if (celebrated) return;
    sessionBroken += 1;
    renderBreakHuds();
    if (sessionBroken >= CENTURION_AT) {
      celebrateCenturion();
      return;
    }
    if (reduced) return;
    clearTimeout(breakTickT);
    for (var i = 0; i < breakHuds.length; i++) {
      var hud = breakHuds[i];
      if (!hud || !hud.isConnected) continue;
      hud.classList.remove("is-tick");
      void hud.offsetWidth;
      hud.classList.add("is-tick");
    }
    breakTickT = setTimeout(function () {
      for (var j = 0; j < breakHuds.length; j++) {
        if (breakHuds[j]) breakHuds[j].classList.remove("is-tick");
      }
    }, 220);
  }

  function ensureBreakHud(section) {
    if (!section || section.__dmBreakHud) {
      if (section && section.__dmBreakHud && breakHuds.indexOf(section.__dmBreakHud) < 0) {
        breakHuds.push(section.__dmBreakHud);
      }
      return section && section.__dmBreakHud;
    }
    var hud = document.createElement("div");
    hud.className = "dm-matrix-breaks";
    hud.setAttribute("aria-hidden", "true");
    hud.setAttribute("data-n", "0");
    hud.textContent = "0";
    section.appendChild(hud);
    section.__dmBreakHud = hud;
    breakHuds.push(hud);
    return hud;
  }

  // Hero + close: trails pass through the card floor.
  function exitPlan() {
    return { exitMode: "pass", fadeAt: Infinity, fadeTtl: 0.45 };
  }

  function beginFade(s, ttl) {
    if (!s || s.state === "fade") return;
    s.state = "fade";
    s.life = 1;
    s.fadeTtl = ttl || (0.4 + Math.random() * 0.35);
    s.vy *= 0.45; // ease out while dissolving on drum/letter contact
  }

  // Remove a trail; shatter=true triggers the pixel debris motif.
  function retire(inst, index, shatter) {
    var s = inst.streams[index];
    if (shatter) {
      makeDebris(inst, s);
      bumpBroken();
    }
    inst.streams.splice(index, 1);
    if (inst.armed) {
      spawn(inst);
      if (shatter) spawn(inst); // whack-a-mole only on shatter
      ensureField(inst);
    }
  }

  function destroy(inst, index) {
    retire(inst, index, true);
  }

  // Hard invariant: while armed/in-view, trails are never zero - fill to cap.
  function ensureField(inst) {
    if (!inst.armed || reduced) return;
    if (inst.streams.length === 0) {
      bootStreams(inst);
      return;
    }
    while (inst.streams.length < inst.maxStreams) spawn(inst);
  }

  function makeDebris(inst, s) {
    var pts = trailPoints(s.points, TRAIL, inst.rowH);
    for (var i = 0; i < pts.length; i++) {
      var y = pts[i].y;
      if (y < -inst.rowH || y > inst.h + inst.rowH) continue;
      var gw = Math.max(inst.fontPx, s.tokens[i].length * inst.fontPx * 0.58);
      var gh = inst.fontPx;
      var count = 6 + ((alphaFor(i, TRAIL) * 18) | 0);
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

  // Sides ~15% preferred over center so rain clears the drum/headline more often.
  var SIDE_BIAS = 0.15;

  function sideWeight(col, nCols) {
    if (nCols <= 1) return 1;
    var mid = (nCols - 1) / 2;
    var edge = Math.abs(col - mid) / mid; // 0 at center → 1 at edges
    return 1 + SIDE_BIAS * edge;
  }

  function freeCol(inst) {
    var n = inst.nCols;
    if (!inst.streams.length) {
      // Weighted pick: edges carry SIDE_BIAS more mass than center.
      var total = 0;
      var weights = new Array(n);
      for (var c = 0; c < n; c++) {
        weights[c] = sideWeight(c, n);
        total += weights[c];
      }
      var r = Math.random() * total;
      for (var i = 0; i < n; i++) {
        r -= weights[i];
        if (r <= 0) return i;
      }
      return n - 1;
    }
    var bestCol = 0, bestDist = -1;
    for (var c = 0; c < n; c++) {
      var occupied = false, minD = n;
      for (var i = 0; i < inst.streams.length; i++) {
        var d = Math.abs(inst.streams[i].col - c);
        if (d === 0) { occupied = true; break; }
        if (d < minD) minD = d;
      }
      if (occupied) continue;
      var score = (minD + Math.random() * 0.5) * sideWeight(c, n);
      if (score > bestDist) { bestDist = score; bestCol = c; }
    }
    return bestCol;
  }

  function glitchGap() {
    return GLITCH_GAP_LO + Math.random() * (GLITCH_GAP_HI - GLITCH_GAP_LO);
  }

  function spawn(inst) {
    if (inst.streams.length >= inst.maxStreams) return;
    var col = freeCol(inst);
    var tokens = [];
    for (var i = 0; i < TRAIL; i++) tokens.push(pick());
    var x = (col + 0.5) * inst.colW;
    // Ongoing rain: enter from above. Initial boot uses spawnLive instead.
    var y = -inst.rowH * (2 + Math.random() * 4);
    var spd = pickSpeed(inst, col);
    var exit = exitPlan();
    inst.streams.push({
      col: col, x: x,
      vx: 0, vy: spd.vy, speedStep: spd.speedStep,
      points: [{ x: x, y: y }],
      tokens: tokens,
      state: "fall",
      life: 1,
      exitMode: exit.exitMode,
      fadeAt: exit.fadeAt,
      fadeTtl: exit.fadeTtl,
      nextGlitch: now() + glitchGap()
    });
  }

  // Seed a trail already mid-fall with a full glyph history for first paint.
  function spawnLive(inst, idx, total) {
    if (inst.streams.length >= inst.maxStreams) return;
    var col = freeCol(inst);
    var tokens = [];
    for (var i = 0; i < TRAIL; i++) tokens.push(pick());
    var x = (col + 0.5) * inst.colW;
    // Spread heads across the field so load never reads as empty sky.
    var slot = (idx + 0.25 + Math.random() * 0.5) / Math.max(1, total);
    var headY = slot * (inst.h * 0.88 + TRAIL * inst.rowH) + inst.rowH * 0.5;
    headY = Math.max(inst.rowH * 1.2, Math.min(inst.h * 0.9, headY));
    var points = [];
    for (var p = TRAIL + 1; p >= 0; p--) {
      points.push({ x: x, y: headY - p * inst.rowH });
    }
    var spd = pickSpeed(inst, col);
    var exit = exitPlan();
    inst.streams.push({
      col: col, x: x,
      vx: 0, vy: spd.vy, speedStep: spd.speedStep,
      points: points,
      tokens: tokens,
      state: "fall",
      life: 1,
      exitMode: exit.exitMode,
      fadeAt: exit.fadeAt,
      fadeTtl: exit.fadeTtl,
      nextGlitch: now() + glitchGap() * (0.35 + Math.random() * 0.65)
    });
  }

  // Instant living field - mid-fall trails visible on first frame (never empty).
  function bootStreams(inst) {
    inst.streams.length = 0;
    var n = Math.max(MIN_STREAMS, inst.maxStreams);
    inst.maxStreams = n;
    for (var i = 0; i < n; i++) spawnLive(inst, i, n);
    inst.nextSpawn = now() + 400;
  }

  // Paint one frame immediately so the first visible paint isn't blank.
  function paintNow(inst) {
    if (!inst || !inst.armed || reduced || !inst.w) return;
    paint(inst, 16);
  }

  function clearLive(inst) {
    inst.streams.length = 0;
    inst.debris.length = 0;
    if (inst.ctx && inst.w) inst.ctx.clearRect(0, 0, inst.w, inst.h);
  }

  // Sync close section to viewport immediately (don't wait on IO alone).
  // Hysteresis avoids arm/disarm thrash at the threshold while scrolling.
  function syncVisibility(inst) {
    if (!inst.waitView || reduced) return;
    var r = inst.el.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    if (inst.armed) {
      var clearlyOut = r.bottom < -64 || r.top > vh + 64;
      if (clearlyOut) {
        inst.armed = false;
        clearLive(inst);
        inst.last = 0;
      } else {
        ensureField(inst);
      }
    } else {
      var clearlyIn = r.bottom > 72 && r.top < vh - 48;
      if (clearlyIn) {
        inst.armed = true;
        bootStreams(inst);
        paintNow(inst);
      }
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
    // Wide rootMargin + low threshold; syncVisibility owns enter/exit hysteresis.
    inst.io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) kick();
        syncVisibility(inst);
      }
    }, { threshold: 0, rootMargin: "120px 0px" });
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
      copyEls: [],
      streams: [], debris: [],
      nCols: 0, colW: 0, rowH: 0, rows: 0, speed: 0, fontPx: 12,
      maxStreams: REF_STREAMS,
      nextSpawn: 0, w: 0, h: 0, dpr: 1, last: 0,
      waitView: waitView,
      armed: !waitView,
      io: null
    };
    el.__dmMatrix = inst;
    if (section) ensureBreakHud(section);
    resize(inst);
    bindDrum(inst);
    bindCopy(inst);
    watchView(inst);
    if (!waitView && !reduced) {
      ensureField(inst);
      paintNow(inst);
    }
    if (reduced) paintStatic(inst);
    return inst;
  }

  function resize(inst) {
    var r = inst.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.floor(r.width));
    var h = Math.max(1, Math.floor(r.height));
    if (w === inst.w && h === inst.h && dpr === inst.dpr) return;

    var prevW = inst.w;
    var prevH = inst.h;
    var prevCols = inst.nCols;
    var prevRowH = inst.rowH;
    var hadField = inst.streams.length > 0;

    // Ignore 1–2px chrome jitter from mobile URL bars / sticky headers while
    // scrolling - full reboot is what reads as flicker going down the page.
    if (prevW > 0 && prevH > 0 && dpr === inst.dpr) {
      var dw = Math.abs(w - prevW);
      var dh = Math.abs(h - prevH);
      if (dw <= 2 && dh <= 2) return;
      if (dw / prevW < 0.02 && dh / prevH < 0.02 && dw < 12 && dh < 12) {
        inst.w = w; inst.h = h;
        inst.canvas.width = Math.floor(w * dpr);
        inst.canvas.height = Math.floor(h * dpr);
        inst.canvas.style.width = w + "px";
        inst.canvas.style.height = h + "px";
        inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (hadField && inst.armed && !reduced) paintNow(inst);
        return;
      }
    }

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
    // Area-scale trail cap from the MacBook Air 15 baseline of 7.
    inst.maxStreams = streamCap(w, h);

    // Prefer remapping live trails over a blank reboot when layout only stretches.
    if (hadField && prevW > 0 && prevCols > 0 && prevRowH > 0 && inst.armed && !reduced) {
      var sy = h / prevH;
      for (var i = 0; i < inst.streams.length; i++) {
        var s = inst.streams[i];
        s.col = Math.min(inst.nCols - 1, Math.max(0, Math.round(s.col * (inst.nCols / prevCols))));
        s.x = (s.col + 0.5) * inst.colW;
        for (var p = 0; p < s.points.length; p++) {
          s.points[p].x = s.x;
          s.points[p].y *= sy;
        }
        if (s.speedStep != null) {
          var mid = inst.speed;
          var spread = Math.sqrt(1 + SPEED_DELTA);
          var lo = mid / spread;
          var hi = mid * spread;
          var t = SPEED_STEPS <= 1 ? 0.5 : s.speedStep / (SPEED_STEPS - 1);
          s.vy = lo + (hi - lo) * t;
        } else {
          s.vy = s.vy * (inst.rowH / prevRowH);
        }
      }
      while (inst.streams.length > inst.maxStreams) inst.streams.pop();
      ensureField(inst);
      paintNow(inst);
    } else {
      inst.streams.length = 0;
      inst.debris.length = 0;
      inst.nextSpawn = 0;
      if (inst.armed && !reduced) {
        bootStreams(inst);
        paintNow(inst);
      }
    }
    bindDrum(inst);
    bindCopy(inst);
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

  // Headline + CTA boxes trails should dissolve against (not punch through).
  function bindCopy(inst) {
    var section = inst.el.closest ? inst.el.closest("section") : null;
    if (!section) {
      inst.copyEls = [];
      return;
    }
    var els = [];
    var title = section.querySelector("h1.dm-hero-title, .dm-hero-core h2");
    var cta = section.querySelector(".dm-hero-cta");
    if (title) els.push(title);
    if (cta) els.push(cta);
    inst.copyEls = els;
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

    var cr = inst._cr || inst.canvas.getBoundingClientRect();
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

  // True if a canvas-space sample sits inside headline or CTA bounds.
  function copyHit(inst, x0, y0, x1, y1) {
    if (!inst.copyEls || !inst.copyEls.length) bindCopy(inst);
    if (!inst.copyEls || !inst.copyEls.length) return null;
    var cr = inst._cr || inst.canvas.getBoundingClientRect();
    var dist = Math.hypot(x1 - x0, y1 - y0);
    var steps = Math.max(4, Math.ceil(dist / 2));
    var padX = Math.max(2, inst.fontPx * 0.35);
    var padY = Math.max(2, inst.fontPx * 0.25);
    for (var s = 0; s <= steps; s++) {
      var t = s / steps;
      var cx = x0 + (x1 - x0) * t;
      var cy = y0 + (y1 - y0) * t;
      var clientX = cr.left + cx;
      var clientY = cr.top + cy;
      for (var e = 0; e < inst.copyEls.length; e++) {
        var el = inst.copyEls[e];
        if (!el || !el.isConnected) continue;
        var r = el.getBoundingClientRect();
        if (
          clientX >= r.left - padX && clientX <= r.right + padX &&
          clientY >= r.top - padY && clientY <= r.bottom + padY
        ) {
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
    return res;
  }

  // Gentler head→tail falloff so more of the trail stays colored.
  function alphaFor(i, total) {
    var f = i / (total - 1 || 1);        // 0 head → 1 tail
    var a = Math.pow(1 - f, 0.55);       // soft curve - not a steep drop
    a = 0.22 + a * 0.36;                 // tail floor .22, head .58
    return a * VIS;
  }

  function drawStream(ctx, inst, s, floorMul) {
    var pts = trailPoints(s.points, TRAIL, inst.rowH);
    var tNow = now();
    if (s.nextGlitch == null) s.nextGlitch = tNow + glitchGap();
    if (tNow >= s.nextGlitch) {
      s.tokens[(Math.random() * TRAIL) | 0] = pick();
      s.nextGlitch = tNow + glitchGap();
    }
    var lifeMul = s.life == null ? 1 : Math.max(0, s.life);
    // Soft ease so obstacle fades read as dissolve, not a hard cut.
    if (s.state === "fade") lifeMul = lifeMul * lifeMul;
    if (floorMul == null) floorMul = 1;
    var mul = lifeMul * floorMul;
    if (mul < 0.01) return;
    for (var i = 0; i < pts.length; i++) {
      var y = pts[i].y;
      if (y < -inst.rowH || y > inst.h + inst.rowH) continue;
      var a = alphaFor(i, TRAIL) * mul;
      if (a < 0.01) continue;
      ctx.fillStyle = "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      ctx.fillText(s.tokens[i], pts[i].x, y);
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
      ctx.fillStyle = "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      var sz = p.size * (0.35 + p.life * 0.65);
      ctx.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
    }
  }

  function paintStatic(inst) {
    var ctx = inst.ctx;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var step = Math.max(1, Math.floor(inst.nCols / inst.maxStreams));
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
    // One layout read per frame - hit tests reuse it (smooth scroll compositing).
    inst._cr = inst.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    if (!inst.drumPaths || !inst.drumPaths.length) bindDrum(inst);
    if (!inst.copyEls || !inst.copyEls.length) bindCopy(inst);

    var maxPathLen = TRAIL * inst.rowH + inst.rowH * 2;

    for (var i = inst.streams.length - 1; i >= 0; i--) {
      var s = inst.streams[i];
      var last = s.points[s.points.length - 1];
      var nx = last.x + s.vx * secs;
      var ny = last.y + s.vy * secs;

      // Drum or letter/CTA contact dissolves smoothly (hero + close).
      var hit = s.state === "fade" ? null : drumHit(inst, last.x, last.y, nx, ny);
      if (!hit && s.state !== "fade") hit = copyHit(inst, last.x, last.y, nx, ny);
      if (hit) {
        s.points.push({ x: hit.x, y: hit.y });
        beginFade(s, 0.45 + Math.random() * 0.28);
        nx = hit.x; ny = hit.y;
      }

      s.points.push({ x: nx, y: ny });

      var lenAcc = 0, keepFrom = 0;
      for (var k = s.points.length - 1; k > 0; k--) {
        lenAcc += Math.hypot(s.points[k].x - s.points[k - 1].x, s.points[k].y - s.points[k - 1].y);
        if (lenAcc > maxPathLen) { keepFrom = k - 1; break; }
      }
      if (keepFrom > 0) s.points.splice(0, keepFrom);

      if (s.state === "fade") {
        s.life -= secs / (s.fadeTtl || 0.5);
        if (s.life <= 0) {
          retire(inst, i, false);
          continue;
        }
      }

      // Pass-through exit (same on land + close).
      if (ny - TRAIL * inst.rowH > inst.h) {
        inst.streams.splice(i, 1);
        spawn(inst);
        spawn(inst);
        ensureField(inst);
        continue;
      }

      drawStream(ctx, inst, s, 1);
    }

    ensureField(inst); // refill after any removals this frame
    drawDebris(ctx, inst, secs);
    inst._cr = null;
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

  // Hover (mouse) or tap (touch/pen) shatters a trail - larger hit on coarse pointers.
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
        var pts = trailPoints(st.points, TRAIL, inst.rowH);
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
    for (var j = 0; j < instances.length; j++) paintNow(instances[j]);
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
