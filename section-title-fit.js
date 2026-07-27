/**
 * Fit section headlines to exactly two lines on every viewport.
 * Each .dm-section-title uses a forced <br> + nowrap; first line stays ink,
 * second line is steel. Binary-searches the largest font-size where neither
 * line overflows the available width.
 */
(function () {
  var SEL = "h2.dm-section-title";
  var MIN = 18;
  var raf = 0;
  var armed = false;

  // Section titles sit in ~1080px content; ceilings stay below the hero.
  var CURVE = [
    [320, 26],
    [400, 30],
    [640, 38],
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

  function fits(el) {
    return el.scrollWidth <= el.clientWidth + 0.5;
  }

  function fitOne(el) {
    if (!el) return;
    var prev = el.style.fontSize;
    el.style.transition = "none";

    var hi = maxForViewport();
    var lo = MIN;
    var best = MIN;
    el.style.setProperty("font-size", hi + "px", "important");
    if (fits(el)) {
      best = hi;
    } else {
      for (var i = 0; i < 40; i++) {
        var mid = (lo + hi) / 2;
        el.style.setProperty("font-size", mid + "px", "important");
        if (fits(el)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
    }

    var target = best.toFixed(2) + "px";
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
    for (var i = 0; i < nodes.length; i++) fitOne(nodes[i]);
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
