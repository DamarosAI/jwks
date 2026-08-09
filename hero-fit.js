/**
 * Fit the hero headline to exactly two lines on every viewport.
 * Relies on a forced <br> + nowrap; binary-searches the largest font-size
 * where neither line overflows the available width.
 *
 * Measures on an off-DOM probe so intermediate sizes never paint — no flash
 * or jitter while fitting. No font-size transitions.
 */
(function () {
  var SEL = 'section[data-screen-label="Hero"] h1.dm-hero-title, section[data-screen-label="Close"] h2.dm-hero-title';
  var MIN = 15;
  var raf = 0;
  var resizeTimer = 0;
  var lastW = 0;

  var CURVE = [
    [320, 22],
    [390, 24],
    [400, 25],
    [640, 30],
    [900, 38],
    [1280, 64],
    [1440, 74]
  ];

  function maxForViewport() {
    var w = window.innerWidth || 1024;
    if (w <= CURVE[0][0]) return CURVE[0][1];
    if (w >= CURVE[CURVE.length - 1][0]) return CURVE[CURVE.length - 1][1];
    for (var i = 1; i < CURVE.length; i++) {
      var a = CURVE[i - 1];
      var b = CURVE[i];
      if (w <= b[0]) {
        var t = (w - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return CURVE[CURVE.length - 1][1];
  }

  function injectStaticStyle() {
    if (document.getElementById("dm-hero-fit-style")) return;
    var st = document.createElement("style");
    st.id = "dm-hero-fit-style";
    st.textContent =
      'section[data-screen-label="Hero"] h1.dm-hero-title,' +
      'section[data-screen-label="Close"] h2.dm-hero-title{' +
      "transition:none !important;" +
      "animation:none !important;" +
      "will-change:auto !important;}";
    (document.head || document.documentElement).appendChild(st);
  }

  function fitsProbe(probe) {
    return probe.scrollWidth <= probe.clientWidth + 0.5;
  }

  function makeProbe(h1) {
    var probe = h1.cloneNode(true);
    probe.removeAttribute("id");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:absolute !important;" +
      "left:-10000px !important;" +
      "top:0 !important;" +
      "visibility:hidden !important;" +
      "pointer-events:none !important;" +
      "display:block !important;" +
      "margin:0 !important;" +
      "transform:none !important;" +
      "transition:none !important;" +
      "animation:none !important;" +
      "white-space:nowrap !important;" +
      "width:" + h1.clientWidth + "px !important;" +
      "max-width:" + h1.clientWidth + "px !important;" +
      "box-sizing:border-box !important;";
    document.body.appendChild(probe);
    return probe;
  }

  function fitOne(h1) {
    if (!h1 || !h1.clientWidth) return;
    var prevPx = parseFloat(h1.style.fontSize) || 0;
    var hi = maxForViewport();
    var lo = MIN;
    var best = MIN;
    var probe = makeProbe(h1);

    probe.style.setProperty("font-size", hi + "px", "important");
    if (fitsProbe(probe)) {
      best = hi;
    } else {
      for (var i = 0; i < 28; i++) {
        var mid = (lo + hi) / 2;
        probe.style.setProperty("font-size", mid + "px", "important");
        if (fitsProbe(probe)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
    }

    if (probe.parentNode) probe.parentNode.removeChild(probe);

    best = Math.max(MIN, best - 0.35);

    // Ignore sub-pixel thrash so the text never visibly breathes.
    if (prevPx && Math.abs(prevPx - best) < 1.0) {
      h1.style.setProperty("font-size", prevPx.toFixed(2) + "px", "important");
      return;
    }

    h1.style.setProperty("font-size", best.toFixed(2) + "px", "important");
  }

  function fitAll() {
    raf = 0;
    var nodes = document.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) fitOne(nodes[i]);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fitAll);
  }

  function scheduleResize() {
    var w = window.innerWidth || 0;
    if (Math.abs(w - lastW) < 2) return;
    lastW = w;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(schedule, 90);
  }

  function boot() {
    injectStaticStyle();
    lastW = window.innerWidth || 0;
    fitAll();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
    // One late settle after layout/fonts — avoid repeated timers that reflow.
    setTimeout(schedule, 200);
  }

  window.addEventListener("resize", scheduleResize, { passive: true });
  window.addEventListener("orientationchange", function () {
    lastW = 0;
    setTimeout(schedule, 100);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", schedule);
})();
