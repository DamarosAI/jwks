/**
 * Fit the hero headline to exactly two lines on every viewport.
 * Relies on a forced <br> + nowrap; binary-searches the largest font-size
 * where neither line overflows the available width.
 *
 * No font-size transitions — the headline must stay optically still.
 */
(function () {
  // Hero + Close share the same drum card composition; fit both to one curve.
  var SEL = 'section[data-screen-label="Hero"] h1.dm-hero-title, section[data-screen-label="Close"] h2.dm-hero-title';
  var MIN = 15;
  var raf = 0;

  // Continuous width -> max font ceiling. Piecewise-linear through control
  // points so the headline scales smoothly across every viewport instead of
  // snapping at a handful of breakpoints. Mobile stays compact so matrix
  // trails clear the lettering.
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
    // Hard-stop any pulse / eased resize on the headline itself.
    st.textContent =
      'section[data-screen-label="Hero"] h1.dm-hero-title,' +
      'section[data-screen-label="Close"] h2.dm-hero-title{' +
      "transition:none !important;" +
      "animation:none !important;" +
      "will-change:auto !important;}";
    (document.head || document.documentElement).appendChild(st);
  }

  function fits(h1) {
    // nowrap + <br> → exactly two line boxes; overflow shows up as scrollWidth.
    // When text fits, block scrollWidth === clientWidth, so only overflow (> )
    // fails this check — do not subtract a margin here or every size fails.
    return h1.scrollWidth <= h1.clientWidth + 0.5;
  }

  function fitOne(h1) {
    if (!h1) return;
    var prevPx = parseFloat(h1.style.fontSize) || 0;

    h1.style.transition = "none";

    var hi = maxForViewport();
    var lo = MIN;
    var best = MIN;
    h1.style.setProperty("font-size", hi + "px", "important");
    if (fits(h1)) {
      best = hi;
    } else {
      // ~40 halving steps → sub-pixel precision, no visible quantization.
      for (var i = 0; i < 40; i++) {
        var mid = (lo + hi) / 2;
        h1.style.setProperty("font-size", mid + "px", "important");
        if (fits(h1)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
    }

    // Nudge down a hair so subpixel AA never clips the final glyph on mobile.
    best = Math.max(MIN, best - 0.35);

    // Ignore sub-pixel thrash from remount/font settling so the text never
    // visibly "breathes" after the first stable fit.
    if (prevPx && Math.abs(prevPx - best) < 0.6) {
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

  function boot() {
    injectStaticStyle();
    fitAll();
    // Fonts / late layout can change metrics after first paint.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
    setTimeout(schedule, 120);
    setTimeout(schedule, 480);
  }

  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", function () {
    setTimeout(schedule, 80);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", schedule);

  // DC remounts - re-fit when hero/close titles reappear.
  var tries = 0;
  var poll = setInterval(function () {
    tries += 1;
    if (document.querySelector(SEL)) {
      schedule();
      if (tries > 6) clearInterval(poll);
    }
    if (tries > 40) clearInterval(poll);
  }, 250);
})();
