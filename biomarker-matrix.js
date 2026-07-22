/**
 * Matrix-style biomarker waterfall for hero / close.
 * Grid-aligned canvas columns of oncogenes, tumor-suppressor genes,
 * and clinical biomarkers falling in CTA blue. Infinite, randomized.
 */
(function () {
  // Oncogenes, tumor-suppressor genes, fusions, and clinical biomarkers.
  var MARKERS = [
    "EGFR", "KRAS", "NRAS", "HRAS", "BRAF", "MET", "ALK", "ROS1", "RET",
    "NTRK1", "NTRK2", "NTRK3", "ERBB2", "HER2", "PIK3CA", "AKT1", "MYC",
    "MYCN", "CCND1", "CDK4", "CDK6", "MDM2", "FGFR1", "FGFR2", "FGFR3",
    "KIT", "PDGFRA", "FLT3", "JAK2", "ABL1", "BCR-ABL", "IDH1", "IDH2",
    "EZH2", "SMO", "GNAQ", "GNA11", "MPL", "CALR", "ESR1", "AR",
    "TP53", "RB1", "PTEN", "APC", "VHL", "NF1", "NF2", "STK11", "LKB1",
    "CDKN2A", "SMAD4", "BRCA1", "BRCA2", "PALB2", "ATM", "CHEK2", "MLH1",
    "MSH2", "MSH6", "PMS2", "MEN1", "TSC1", "TSC2", "WT1", "DCC", "FBXW7",
    "KEAP1", "STK11", "ARID1A", "SMARCB1", "MTAP",
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

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var instances = [];
  var raf = 0;

  function pick() {
    return MARKERS[(Math.random() * MARKERS.length) | 0];
  }

  function makeColumn(rows) {
    var cells = [];
    for (var i = 0; i < rows; i++) cells.push(pick());
    var trail = 5 + ((Math.random() * 7) | 0);
    return {
      cells: cells,
      trail: trail,
      head: -Math.random() * rows, // float row index of the leading glyph
      speed: 3.2 + Math.random() * 4.8 // rows per second
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
    if (reduced) paintStatic(inst);
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

    // Distribute columns evenly edge-to-edge so nothing is clipped.
    var target = w < 640 ? 58 : 72;
    var nCols = Math.max(4, Math.round(w / target));
    var rowH = w < 640 ? 18 : 20;
    var rows = Math.max(8, Math.ceil(h / rowH) + 2);
    inst.colW = w / nCols;
    inst.rowH = rowH;
    inst.rows = rows;
    inst.cols = [];
    for (var i = 0; i < nCols; i++) inst.cols.push(makeColumn(rows));
    inst.fontPx = Math.max(10, Math.floor(rowH * 0.6));
  }

  function drawColumn(inst, c, animate) {
    var ctx = inst.ctx;
    var col = inst.cols[c];
    var rows = inst.rows;
    var rowH = inst.rowH;
    var x = Math.round((c + 0.5) * inst.colW);
    var headInt = Math.floor(col.head);

    for (var i = 0; i < col.trail; i++) {
      var row = headInt - i;
      if (row < 0 || row >= rows) continue;
      var y = row * rowH + rowH * 0.5;

      var a;
      if (i === 0) a = 0.5;
      else if (i === 1) a = 0.38;
      else a = Math.max(0.05, 0.32 - (i - 1) * 0.045);

      ctx.fillStyle = "rgba(" + BLUE + "," + a.toFixed(3) + ")";
      ctx.fillText(col.cells[row % col.cells.length], x, y);
    }

    if (animate && Math.random() < 0.06) {
      col.cells[((Math.random() * col.cells.length) | 0)] = pick();
    }
  }

  function paintStatic(inst) {
    var ctx = inst.ctx;
    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var c = 0; c < inst.cols.length; c++) {
      var col = inst.cols[c];
      var x = Math.round((c + 0.5) * inst.colW);
      for (var r = 0; r < col.cells.length; r++) {
        if ((r + c) % 2 !== 0) continue;
        var y = r * inst.rowH + inst.rowH * 0.5;
        ctx.fillStyle = "rgba(" + BLUE + "," + (0.12 + ((r + c) % 4) * 0.03).toFixed(3) + ")";
        ctx.fillText(col.cells[r], x, y);
      }
    }
  }

  function paint(inst, dt) {
    var ctx = inst.ctx;
    var rows = inst.rows;
    var secs = dt / 1000;

    ctx.clearRect(0, 0, inst.w, inst.h);
    ctx.font = "600 " + inst.fontPx + "px \"IBM Plex Mono\", ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var c = 0; c < inst.cols.length; c++) {
      var col = inst.cols[c];
      col.head += col.speed * secs;
      if (col.head - col.trail > rows) {
        // Recycle above the top with fresh randomization — infinite stream.
        col.head = -Math.random() * rows * 0.5;
        col.trail = 5 + ((Math.random() * 7) | 0);
        col.speed = 3.2 + Math.random() * 4.8;
        for (var k = 0; k < col.cells.length; k++) col.cells[k] = pick();
      }
      drawColumn(inst, c, true);
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
      if (!visible) {
        inst.last = 0;
        continue;
      }
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
