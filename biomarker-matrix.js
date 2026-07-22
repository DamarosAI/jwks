/**
 * Super-subtle Matrix-style biomarker waterfall for hero / close.
 * Canvas columns of clinical tokens falling slowly in CTA blue.
 */
(function () {
  var MARKERS = [
    "EGFR", "ALK", "KRAS", "G12C", "HER2", "PD-L1", "MSI-H", "dMMR",
    "BRAF", "TMB", "NTRK", "ROS1", "RET", "BRCA1", "MET", "T790M",
    "C797S", "ECOG", "RECIST", "FHIR", "CLIA", "CAP", "IHC", "NGS"
  ];

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var instances = [];
  var raf = 0;

  function pick() {
    return MARKERS[(Math.random() * MARKERS.length) | 0];
  }

  function makeColumn(rows) {
    var cells = [];
    for (var i = 0; i < rows; i++) cells.push(pick());
    return {
      cells: cells,
      y: Math.random() * rows,
      speed: 0.012 + Math.random() * 0.028,
      head: (Math.random() * rows) | 0
    };
  }

  function mount(el) {
    if (!el || el.__dmMatrix) return null;
    var canvas = document.createElement("canvas");
    canvas.className = "dm-matrix-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;

    var inst = {
      el: el,
      canvas: canvas,
      ctx: ctx,
      cols: [],
      colW: 0,
      rowH: 0,
      rows: 0,
      w: 0,
      h: 0,
      dpr: 1,
      last: 0
    };
    el.__dmMatrix = inst;
    resize(inst);
    if (reduced) {
      paintStatic(inst);
      return inst;
    }
    return inst;
  }

  function resize(inst) {
    var r = inst.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.floor(r.width));
    var h = Math.max(1, Math.floor(r.height));
    if (w === inst.w && h === inst.h && dpr === inst.dpr) return;

    inst.w = w;
    inst.h = h;
    inst.dpr = dpr;
    inst.canvas.width = Math.floor(w * dpr);
    inst.canvas.height = Math.floor(h * dpr);
    inst.canvas.style.width = w + "px";
    inst.canvas.style.height = h + "px";
    inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var colW = w < 640 ? 52 : 64;
    var rowH = w < 640 ? 16 : 18;
    var nCols = Math.max(4, Math.ceil(w / colW));
    var rows = Math.max(8, Math.ceil(h / rowH) + 4);
    inst.colW = colW;
    inst.rowH = rowH;
    inst.rows = rows;
    inst.cols = [];
    for (var i = 0; i < nCols; i++) inst.cols.push(makeColumn(rows));
  }

  function paintStatic(inst) {
    var ctx = inst.ctx;
    var cols = inst.cols;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "500 " + Math.max(9, Math.floor(inst.rowH * 0.62)) + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      var x = (c + 0.5) * inst.colW;
      for (var r = 0; r < col.cells.length; r++) {
        if ((r + c) % 3 !== 0) continue;
        var y = (r + 0.5) * inst.rowH;
        ctx.fillStyle = "rgba(61,114,168," + (0.04 + ((r + c) % 5) * 0.012) + ")";
        ctx.fillText(col.cells[r], x, y);
      }
    }
  }

  function paint(inst, dt) {
    var ctx = inst.ctx;
    var cols = inst.cols;
    var rows = inst.rows;
    var rowH = inst.rowH;

    ctx.clearRect(0, 0, inst.w, inst.h);

    ctx.font = "500 " + Math.max(9, Math.floor(rowH * 0.62)) + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var c = 0; c < cols.length; c++) {
      var col = cols[c];
      col.y += col.speed * dt * 0.055;
      if (col.y > rows) {
        col.y -= rows;
        col.head = (col.head + 1 + ((Math.random() * 3) | 0)) % rows;
        col.speed = 0.012 + Math.random() * 0.028;
      }

      var x = (c + 0.5) * inst.colW;
      var head = Math.floor(col.y) % rows;
      for (var i = 0; i < Math.min(14, rows); i++) {
        var idx = (head - i + rows * 4) % rows;
        var y = ((col.y - i) % rows) * rowH;
        if (y < -rowH || y > inst.h + rowH) continue;

        var token = col.cells[idx];
        // Head slightly brighter; body fades fast — overall very quiet
        var a;
        if (i === 0) a = 0.2;
        else if (i < 3) a = 0.11 - i * 0.02;
        else if (i < 8) a = 0.055 - (i - 3) * 0.006;
        else a = 0.016;

        if (a < 0.012) continue;
        // Sparse: skip most mid-trail glyphs so it reads as rain, not noise
        if (i > 2 && ((idx + c) % 2 === 0)) continue;

        ctx.fillStyle = "rgba(61,114,168," + a.toFixed(3) + ")";
        ctx.fillText(token, x, y);

        if (i === 0 && Math.random() < 0.04) {
          col.cells[idx] = pick();
        }
      }
    }
  }

  function tick(now) {
    raf = 0;
    var any = false;
    for (var i = 0; i < instances.length; i++) {
      var inst = instances[i];
      if (!inst.el.isConnected) continue;
      var r = inst.el.getBoundingClientRect();
      var visible = r.bottom > -20 && r.top < window.innerHeight + 20;
      if (!visible) continue;
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
      if (inst) {
        resize(inst);
        next.push(inst);
      }
    }
    instances = next;
    return instances.length > 0;
  }

  function boot() {
    if (!collect()) return;
    if (reduced) return;
    // Seed with a faint base so first frame isn't empty
    for (var i = 0; i < instances.length; i++) {
      paintStatic(instances[i]);
      instances[i].last = 0;
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

  // DC remounts template content — rebind when .dm-matrix appears
  var tries = 0;
  var poll = setInterval(function () {
    tries += 1;
    var ok = collect();
    if (ok) {
      if (reduced) {
        for (var i = 0; i < instances.length; i++) paintStatic(instances[i]);
      } else {
        kick();
      }
    }
    if (ok && tries > 8) clearInterval(poll);
    if (tries > 40) clearInterval(poll);
  }, 250);
})();
