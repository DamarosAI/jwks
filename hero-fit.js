/**
 * Fit the hero headline to exactly two lines on every viewport.
 * Relies on a forced <br> + nowrap; binary-searches the largest font-size
 * where neither line overflows the available width.
 */
(function () {
  var SEL = 'section[data-screen-label="Hero"] h1.dm-hero-title';
  var MIN = 15;
  var raf = 0;

  function maxForViewport() {
    var w = window.innerWidth || 1024;
    // Generous ceiling — fitter will walk down until it fits.
    if (w < 400) return 34;
    if (w < 640) return 44;
    if (w < 900) return 56;
    if (w < 1280) return 64;
    return 74; // ~4.6rem
  }

  function fits(h1) {
    // nowrap + <br> → exactly two line boxes; overflow shows up as scrollWidth.
    return h1.scrollWidth <= h1.clientWidth + 0.5;
  }

  function fitOne(h1) {
    if (!h1) return;
    var hi = maxForViewport();
    var lo = MIN;
    var best = MIN;
    // Seed high so we always search downward from a known-overflow or max.
    h1.style.setProperty("font-size", hi + "px", "important");
    if (fits(h1)) {
      best = hi;
    } else {
      for (var i = 0; i < 20; i++) {
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

  // DC remounts — re-fit when the hero h1 reappears.
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
