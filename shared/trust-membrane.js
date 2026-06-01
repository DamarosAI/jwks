/* ============================================================
 * Damaros access graph - the governed network.
 *
 *     Sponsors  ->  Damaros  ->  Sites
 *               <-           <-
 *
 *   Glow-field aesthetic. The core is a rectangle holding the
 *   "Damaros" wordmark (HTML). Flow-dots PHASE IN/OUT at the core
 *   edge - nothing travels behind the wordmark or past a line.
 *   PHI is sealed inside each site.
 * ============================================================ */
(function () {
  var stage = document.getElementById("tbStage"); if (!stage) return;
  var cv = document.getElementById("tbField"); if (!cv) return;
  var ctx = cv.getContext("2d");
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, last = 0;
  var C = {};
  var sponsors = [], core, coreW, coreH, sites = [], tokens = [], probes = [], beamL = null, beamR = null, lastBeam = 0;

  function hexToRgb(h) { if (!h || h.charAt(0) !== "#") return null; h = h.slice(1); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n = parseInt(h, 16); return [(n>>16)&255,(n>>8)&255,n&255]; }
  function readColors() {
    var cs = getComputedStyle(document.documentElement), g = function (n) { return cs.getPropertyValue(n).trim(); };
    C.blue  = hexToRgb(g("--accent-2")) || [169,192,214];
    C.green = hexToRgb(g("--locked"))   || [60,200,140];
    C.value = hexToRgb(g("--pass"))     || [74,222,128];
    C.red   = hexToRgb(g("--fail"))     || [251,113,133];
    C.line  = hexToRgb(g("--bd-strong"))|| [70,84,100];
    C.dim   = hexToRgb(g("--fg-3"))     || [120,134,150];
    C.fg    = hexToRgb(g("--fg-2"))     || [190,200,210];
  }
  function rgb(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a<0?0:a>1?1:a) + ")"; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function layout() {
    var r = stage.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var cyc = H * 0.44, sr = Math.max(8, Math.min(12, W * 0.016));
    // a few sponsors
    sponsors = [];
    var SN = (W < 560) ? 2 : 3, ss = Math.min(H * 0.16, (H - coreHGuess()) * 0.4);
    for (var i = 0; i < SN; i++) { var fy = (SN === 1) ? 0 : (i / (SN - 1) * 2 - 1); sponsors.push({ x: W * 0.15, y: cyc + fy * ss, r: sr }); }
    core = { x: W * 0.5, y: cyc };
    coreW = Math.max(108, Math.min(168, W * 0.2)); coreH = Math.max(42, Math.min(58, H * 0.13));
    // a bunch of sites
    var N = (W < 560) ? 6 : 9;
    sites = [];
    var top = H * 0.12, bot = H * 0.88;
    for (var s = 0; s < N; s++) {
      var fy2 = (N === 1) ? 0.5 : s / (N - 1);
      var col = (s % 2 === 0) ? 0.82 : 0.9;
      sites.push({ x: W * (W < 560 ? 0.84 : col), y: top + fy2 * (bot - top), r: Math.max(6, Math.min(10, Math.min(W, H) * 0.022)), phi: [] });
    }
    build();
  }
  function coreHGuess() { return 56; }

  function build() {
    for (var s = 0; s < sites.length; s++) { sites[s].phi = []; for (var p = 0; p < 2; p++) sites[s].phi.push({ a: rnd(0, 6.28), rr: rnd(0.25, 0.6) * sites[s].r, sp: rnd(0.4, 0.9) * (Math.random() < 0.5 ? 1 : -1), ph: rnd(0, 6.28) }); }
    tokens = []; var kinds = ["protocol", "packet", "protocol", "packet", "protocol", "packet"]; var KN = (W < 560) ? 6 : 10;
    for (var k = 0; k < KN; k++) tokens.push(newToken(kinds[k % kinds.length], rnd(0, 4)));
    probes = []; for (var q = 0; q < 3; q++) probes.push(newProbe(rnd(0, 3.4)));
  }
  function siteOf() { return sites[Math.floor(Math.random() * sites.length)]; }
  function sponsorOf() { return sponsors[Math.floor(Math.random() * sponsors.length)]; }
  function newToken(kind, wait) {
    var st = siteOf(), sp = sponsorOf(), path;
    if (kind === "protocol")     path = [ { x: sp.x, y: sp.y }, { x: core.x, y: core.y, dwell: 0.3 }, { x: st.x, y: st.y } ];  // sponsor deploys a protocol to a site
    else if (kind === "packet")  path = [ { x: st.x, y: st.y }, { x: core.x, y: core.y, dwell: 0.3 }, { x: sp.x, y: sp.y } ];  // governed referral packet returns to a sponsor
    else if (kind === "insight") path = [ { x: core.x, y: core.y }, { x: st.x, y: st.y } ];                                    // Damaros sends governed signals out to a site
    else                         path = [ { x: core.x, y: core.y }, { x: sp.x, y: sp.y } ];                                    // Damaros sends analytics out to a sponsor
    return { kind: kind, path: path, seg: 0, t: 0, dwell: 0, wait: wait || 0 };
  }
  function newProbe(wait) { var st = siteOf(), ang = Math.atan2(core.y - st.y, core.x - st.x); return { site: st, ang: ang, d: 0, v: rnd(16, 28), wait: wait, fade: 0 }; }

  function dot(x, y, r, col, a, glow) {
    if (glow) { ctx.shadowColor = rgb(col, 0.9); ctx.shadowBlur = glow; }
    ctx.fillStyle = rgb(col, a); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    if (glow) ctx.shadowBlur = 0;
  }
  function halo(x, y, r, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgb(col, a)); g.addColorStop(1, rgb(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  function roundRect(x, y, w, h, rad) { ctx.beginPath(); ctx.moveTo(x+rad, y); ctx.arcTo(x+w, y, x+w, y+h, rad); ctx.arcTo(x+w, y+h, x, y+h, rad); ctx.arcTo(x, y+h, x, y, rad); ctx.arcTo(x, y, x+w, y, rad); ctx.closePath(); }
  // 0 inside the core box, ramps to 1 just outside (drives token phase in/out)
  function coreFade(x, y) { var nd = Math.max(Math.abs(x - core.x) / (coreW / 2 + 6), Math.abs(y - core.y) / (coreH / 2 + 6)); return Math.max(0, Math.min(1, (nd - 1) / 0.55)); }
  // point on the core-box edge along the ray from core center toward (tx,ty)
  function edgePoint(tx, ty) {
    var dx = tx - core.x, dy = ty - core.y, hw = coreW / 2 + 2, hh = coreH / 2 + 2;
    var sx = dx === 0 ? 1e9 : hw / Math.abs(dx), sy = dy === 0 ? 1e9 : hh / Math.abs(dy), s = Math.min(sx, sy);
    return { x: core.x + dx * s, y: core.y + dy * s };
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; var t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    drawLinks();
    for (var s = 0; s < sites.length; s++) drawSite(sites[s], t);
    for (var p = 0; p < sponsors.length; p++) drawSponsor(sponsors[p]);
    drawCore(t);
    label("Sponsors \u00b7 CROs \u00b7 Networks", sponsors[sponsors.length - 1].x, sponsors[sponsors.length - 1].y + sponsors[0].r + 15, C.fg, 8.5);
    label("Sites", core.x + (W * 0.86 - core.x), H * 0.94, C.fg);
    drawTokens(t, dt);
    drawBeams(now, dt);
    drawProbes(t, dt);
    requestAnimationFrame(frame);
  }

  function drawLinks() {
    ctx.lineWidth = 1; ctx.strokeStyle = rgb(C.line, 0.18); ctx.beginPath();
    for (var p = 0; p < sponsors.length; p++) { var e = edgePoint(sponsors[p].x, sponsors[p].y); ctx.moveTo(e.x, e.y); ctx.lineTo(sponsors[p].x, sponsors[p].y); }
    for (var s = 0; s < sites.length; s++) { var e2 = edgePoint(sites[s].x, sites[s].y); ctx.moveTo(e2.x, e2.y); ctx.lineTo(sites[s].x, sites[s].y); }
    ctx.stroke();
  }

  function drawSponsor(n) { // no glow
    ctx.strokeStyle = rgb(C.blue, 0.45); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.stroke();
    dot(n.x, n.y, n.r * 0.4, C.blue, 0.9, 0); ctx.lineWidth = 1;
  }

  function drawCore(t) {
    var pulse = 0.5 + 0.5 * Math.sin(t * 1.1);
    var x = core.x - coreW / 2, y = core.y - coreH / 2;
    roundRect(x, y, coreW, coreH, 9); ctx.fillStyle = rgb(C.blue, 0.05); ctx.fill();
    ctx.strokeStyle = rgb(C.blue, 0.4 + 0.16 * pulse); ctx.lineWidth = 1.2; ctx.stroke();
    roundRect(x - 5, y - 5, coreW + 10, coreH + 10, 12); ctx.strokeStyle = rgb(C.blue, 0.1); ctx.lineWidth = 1; ctx.stroke();
    ctx.lineWidth = 1;
  }

  function drawSite(st, t) {
    halo(st.x, st.y, st.r * 2.4, C.green, 0.1);
    ctx.strokeStyle = rgb(C.green, 0.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0.22, 6.2832 - 0.22); ctx.stroke();
    for (var p = 0; p < st.phi.length; p++) { var ph = st.phi[p], a = ph.a + t * ph.sp * 0.4; var x = st.x + Math.cos(a) * ph.rr, y = st.y + Math.sin(a) * ph.rr; var pl = 0.5 + 0.5 * Math.sin(t * 2 + ph.ph); dot(x, y, 1.1, C.red, 0.4 + 0.35 * pl, 3); }
    ctx.lineWidth = 1;
  }

  function drawTokens(t, dt) {
    for (var i = 0; i < tokens.length; i++) {
      var tk = tokens[i];
      if (tk.wait > 0) { tk.wait -= dt; continue; }
      var P = tk.path, pos;
      if (tk.dwell > 0) { tk.dwell -= dt; pos = P[tk.seg]; }
      else {
        var a = P[tk.seg], b = P[tk.seg + 1];
        if (!b) { tokens[i] = newToken(tk.kind, rnd(0.1, 1.4)); continue; }
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        tk.t += (150 * dt) / len;
        if (tk.t >= 1) { tk.t = 0; tk.seg++; pos = b; var nb = P[tk.seg]; if (nb && nb.dwell) tk.dwell = nb.dwell; }
        else pos = { x: a.x + dx * tk.t, y: a.y + dy * tk.t };
      }
      var fade = coreFade(pos.x, pos.y); if (fade <= 0.02) continue; // invisible inside / behind the wordmark
      var col = tk.kind === "protocol" ? C.blue : C.green;
      dot(pos.x, pos.y, 2.1, col, 0.95 * fade, 10 * fade);
    }
  }

  function drawBeams(now, dt) {
    if (now - lastBeam > 2400) { beamL = { node: sponsorOf(), p: 0 }; beamR = { node: siteOf(), p: 0 }; lastBeam = now; }
    var pair = [beamL, beamR];
    ctx.lineCap = "round";
    for (var i = 0; i < 2; i++) {
      var bm = pair[i]; if (!bm || bm.p >= 1) continue;
      bm.p += dt * 0.6;
      var e = edgePoint(bm.node.x, bm.node.y), dxn = bm.node.x - e.x, dyn = bm.node.y - e.y;
      var hp = Math.min(1, bm.p), tp = Math.max(0, bm.p - 0.32);
      var hx = e.x + dxn * hp, hy = e.y + dyn * hp, tx = e.x + dxn * tp, ty = e.y + dyn * tp;
      var grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, rgb(C.value, 0)); grad.addColorStop(1, rgb(C.value, 0.92));
      ctx.strokeStyle = grad; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      dot(hx, hy, 3, C.value, 0.95, 14);
    }
    ctx.lineCap = "butt"; ctx.lineWidth = 1;
  }

  function drawProbes(t, dt) {
    for (var i = 0; i < probes.length; i++) {
      var pr = probes[i];
      if (pr.wait > 0) { pr.wait -= dt; continue; }
      if (pr.fade > 0) { pr.fade -= dt; var fx = pr.site.x + Math.cos(pr.ang) * pr.site.r, fy = pr.site.y + Math.sin(pr.ang) * pr.site.r; dot(fx, fy, 1 + pr.fade * 5, C.red, pr.fade * 1.4, 5); if (pr.fade <= 0) probes[i] = newProbe(rnd(1.6, 3.6)); continue; }
      pr.d += pr.v * dt;
      var x = pr.site.x + Math.cos(pr.ang) * pr.d, y = pr.site.y + Math.sin(pr.ang) * pr.d;
      dot(x, y, 1.4, C.red, 0.85, 5);
      if (pr.d >= pr.site.r) pr.fade = 0.4;
    }
  }

  function label(txt, x, y, col, size) {
    ctx.font = "600 " + (size || 9.5) + 'px "Space Grotesk", ui-monospace, monospace';
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.save(); ctx.letterSpacing = "1.2px"; ctx.fillStyle = rgb(col, 0.74); ctx.fillText(txt, x, y); ctx.restore();
  }

  function staticFrame() {
    ctx.clearRect(0, 0, W, H); drawLinks();
    for (var s = 0; s < sites.length; s++) drawSite(sites[s], 0);
    for (var p = 0; p < sponsors.length; p++) drawSponsor(sponsors[p]); drawCore(0);
    label("Sponsors \u00b7 CROs \u00b7 Networks", sponsors[sponsors.length - 1].x, sponsors[sponsors.length - 1].y + sponsors[0].r + 15, C.fg, 8.5);
    label("Sites", W * 0.86, H * 0.94, C.fg);
  }
  function start() { readColors(); layout(); if (REDUCED) { staticFrame(); return; } last = performance.now(); requestAnimationFrame(frame); }
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { layout(); if (REDUCED) staticFrame(); }, 150); });
  new MutationObserver(function () { readColors(); if (REDUCED) staticFrame(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start);
})();
