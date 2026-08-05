/**
 * Fit section headlines to one shared size across every section.
 * Each .dm-section-title uses a forced <br> + nowrap; first line stays ink,
 * second line is steel. Picks the largest viewport font that fits every
 * title against a shared content width, so narrow columns cannot shrink
 * one header below the rest.
 */
(function () {
  var SEL = "h2.dm-section-title";
  var MIN = 18;
  var raf = 0;
  var armed = false;

  // Section titles sit in ~1080px content; ceilings stay below the hero.
  var CURVE = [
    [320, 24],
    [400, 28],
    [640, 36],
    [900, 46],
    [1280, 52],
    [1440, 56]
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

  var reduced = false;
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function injectTransitionStyle() {
    if (document.getElementById("dm-section-title-fit-style")) return;
    var st = document.createElement("style");
    st.id = "dm-section-title-fit-style";
    st.textContent =
      "h2.dm-section-title{" +
      "transition:font-size 260ms cubic-bezier(0.22,1,0.36,1);will-change:font-size;}" +
      "@media (prefers-reduced-motion:reduce){" +
      "h2.dm-section-title{transition:none;}}";
    (document.head || document.documentElement).appendChild(st);
  }

  function contentWidth(el) {
    var node = el;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains("dm-scroll-target")) {
        return node.clientWidth;
      }
      node = node.parentElement;
    }
    return el.clientWidth;
  }

  function sharedWidth(nodes) {
    var best = 0;
    for (var i = 0; i < nodes.length; i++) {
      var w = contentWidth(nodes[i]);
      if (w > best) best = w;
    }
    return best || (window.innerWidth || 1024);
  }

  function fitsAt(el, width, size) {
    var prevSize = el.style.fontSize;
    var prevWidth = el.style.width;
    var prevMax = el.style.maxWidth;
    el.style.setProperty("font-size", size + "px", "important");
    el.style.setProperty("width", width + "px", "important");
    el.style.setProperty("max-width", width + "px", "important");
    var ok = el.scrollWidth <= width + 0.5;
    if (prevSize) el.style.setProperty("font-size", prevSize, "important");
    else el.style.removeProperty("font-size");
    if (prevWidth) el.style.width = prevWidth;
    else el.style.removeProperty("width");
    if (prevMax) el.style.maxWidth = prevMax;
    else el.style.removeProperty("max-width");
    return ok;
  }

  function bestSizeFor(el, width, hi) {
    if (fitsAt(el, width, hi)) return hi;
    var lo = MIN;
    var best = MIN;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2;
      if (fitsAt(el, width, mid)) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return best;
  }

  function applySize(el, target) {
    var prev = el.style.fontSize;
    el.style.transition = "none";
    if (armed && !reduced && prev && prev !== target) {
      el.style.setProperty("font-size", prev, "important");
      void el.offsetWidth;
      el.style.transition = "";
      el.style.setProperty("font-size", target, "important");
    } else {
      el.style.transition = "";
      el.style.setProperty("font-size", target, "important");
    }
  }

  function fitAll() {
    raf = 0;
    var nodes = document.querySelectorAll(SEL);
    if (!nodes.length) return;

    var width = sharedWidth(nodes);
    var hi = maxForViewport();
    var shared = hi;

    for (var i = 0; i < nodes.length; i++) {
      var size = bestSizeFor(nodes[i], width, hi);
      if (size < shared) shared = size;
    }

    var target = shared.toFixed(2) + "px";
    for (var j = 0; j < nodes.length; j++) applySize(nodes[j], target);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fitAll);
  }

  function boot() {
    injectTransitionStyle();
    fitAll();
    requestAnimationFrame(function () { armed = true; });
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
