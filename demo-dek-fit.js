/**
 * Keep live-demo agent dek lines and the Demo section caption on one line.
 * Binary-searches font-size so scrollWidth fits available width.
 */
(function () {
  var TARGETS = [
    { sel: "#instrument .dm-demo-dek", max: 13.5, min: 10, mode: "panel" },
    { sel: "#instrument .dm-demo-caption", max: 20, min: 12, mode: "section" }
  ];
  var raf = 0;

  function fits(el) {
    return el.scrollWidth <= el.clientWidth + 0.5;
  }

  function availableWidth(el, mode) {
    if (mode === "section") {
      var stage = document.getElementById("nodeStage") || el.parentElement;
      var w = stage ? stage.clientWidth : 0;
      if (w < 40 && el.parentElement) w = el.parentElement.clientWidth;
      return Math.max(0, w - 8);
    }
    var parent = el.parentElement;
    if (!parent) return el.clientWidth || 0;
    var style = window.getComputedStyle(parent);
    var pad =
      (parseFloat(style.paddingLeft) || 0) +
      (parseFloat(style.paddingRight) || 0);
    return Math.max(0, parent.clientWidth - pad);
  }

  function fitOne(el, max, min, mode) {
    if (!el || !el.isConnected) return;
    var width = availableWidth(el, mode);
    if (width < 40) return;

    el.style.setProperty("white-space", "nowrap", "important");
    el.style.setProperty("max-width", "none", "important");
    el.style.setProperty("width", width + "px", "important");
    el.style.setProperty("overflow", "hidden", "important");
    el.style.transition = "none";

    var hi = max;
    var lo = min;
    var best = min;
    el.style.setProperty("font-size", hi + "px", "important");
    if (fits(el)) {
      best = hi;
    } else {
      for (var i = 0; i < 36; i++) {
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
    el.style.setProperty("font-size", best.toFixed(2) + "px", "important");
  }

  function fitAll() {
    raf = 0;
    for (var t = 0; t < TARGETS.length; t++) {
      var cfg = TARGETS[t];
      var nodes = document.querySelectorAll(cfg.sel);
      for (var i = 0; i < nodes.length; i++) fitOne(nodes[i], cfg.max, cfg.min, cfg.mode);
    }
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fitAll);
  }

  function boot() {
    fitAll();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
    setTimeout(schedule, 120);
    setTimeout(schedule, 480);

    var root = document.getElementById("instrument");
    if (root && typeof MutationObserver !== "undefined") {
      var mo = new MutationObserver(schedule);
      mo.observe(root, { childList: true, subtree: true });
    }
  }

  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener(
    "orientationchange",
    function () {
      setTimeout(schedule, 80);
    },
    { passive: true }
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", schedule);
})();
