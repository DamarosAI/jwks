/*
 * Section-by-section wheel scrolling on desktop / trackpad.
 *
 * Root problem this solves: a macOS trackpad emits ONE physical swipe as a
 * long stream of momentum `wheel` events that can keep firing for 1-2 seconds.
 * A fixed cooldown measured from the moment we scroll is not enough - once the
 * cooldown expires while momentum is still streaming, the next event triggers a
 * second jump and the page "skips" sections.
 *
 * Fix: treat a gesture as finished only after the wheel has been QUIET for
 * IDLE_GAP ms. Every wheel event (even the ones we swallow) pushes the idle
 * timer forward, so a single fling - however long its momentum tail - advances
 * exactly one section. Each target section is centered vertically.
 */
(function () {
  var coarse = window.matchMedia("(max-width:760px),(pointer:coarse)");
  if (coarse.matches) return;

  var reduced = window.matchMedia("(prefers-reduced-motion:reduce)");
  var HEADER = 62;
  var DURATION = 500;
  // A gesture is only "over" after the wheel is silent this long. Must exceed
  // the spacing between decaying trackpad momentum events (~50-120ms).
  var IDLE_GAP = 260;
  var MIN_DELTA = 2;

  var sections = [];
  var animating = false;
  var lastWheel = 0;

  var html = document.documentElement;
  html.style.scrollBehavior = "auto";
  html.style.scrollSnapType = "none";

  function collect() {
    sections = Array.prototype.slice.call(
      document.querySelectorAll(".dm-site section[data-screen-label]")
    );
    sections.forEach(function (s) {
      s.style.scrollSnapAlign = "none";
      s.style.scrollSnapStop = "normal";
    });
  }

  function maxScroll() {
    return Math.max(0, html.scrollHeight - window.innerHeight);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Center the section vertically. If it is taller than the usable viewport,
  // pin its top just below the header instead.
  function targetFor(el) {
    var r = el.getBoundingClientRect();
    var elTop = r.top + window.scrollY;
    var usable = window.innerHeight - HEADER;
    var top;
    if (r.height >= usable) {
      top = elTop - HEADER;
    } else {
      top = elTop - HEADER - (usable - r.height) / 2;
    }
    return Math.max(0, Math.min(top, maxScroll()));
  }

  function glideTo(target) {
    target = Math.max(0, Math.min(target, maxScroll()));

    if (reduced.matches || DURATION === 0) {
      window.scrollTo(0, target);
      return;
    }

    animating = true;
    var startY = window.scrollY;
    var dist = target - startY;
    if (Math.abs(dist) < 1) {
      animating = false;
      return;
    }
    var startT = performance.now();

    function frame(now) {
      var p = Math.min(1, (now - startT) / DURATION);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        animating = false;
        // Momentum may still be arriving; keep the gesture locked until quiet.
        lastWheel = performance.now();
      }
    }
    requestAnimationFrame(frame);
  }

  // Index of the section whose center is nearest the viewport center. Keeps
  // forward and backward stepping symmetric.
  function currentIndex() {
    var mid = window.scrollY + window.innerHeight / 2;
    var idx = 0;
    var best = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      var center = r.top + window.scrollY + r.height / 2;
      var d = Math.abs(center - mid);
      if (d < best) {
        best = d;
        idx = i;
      }
    }
    return idx;
  }

  function innerHandles(node, dir) {
    while (node && node.nodeType === 1 && node !== document.body) {
      var oy = getComputedStyle(node).overflowY;
      if (
        (oy === "auto" || oy === "scroll" || oy === "overlay") &&
        node.scrollHeight > node.clientHeight + 2
      ) {
        if (dir > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1)
          return true;
        if (dir < 0 && node.scrollTop > 1) return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function onWheel(e) {
    if (e.ctrlKey) return; // pinch-zoom
    var dy = e.deltaY;
    var dir = dy > MIN_DELTA ? 1 : dy < -MIN_DELTA ? -1 : 0;
    if (!dir) return;

    // Let a genuinely scrollable inner panel take the gesture natively.
    if (innerHandles(e.target, dir)) return;

    // We own vertical page scrolling from here on.
    e.preventDefault();

    var now = performance.now();
    var quiet = now - lastWheel >= IDLE_GAP;
    // Every event refreshes the idle timer so momentum keeps the lock alive.
    lastWheel = now;

    if (animating || !quiet) return;

    if (sections.length < 2) return;
    var next = dir > 0 ? currentIndex() + 1 : currentIndex() - 1;
    if (next < 0 || next >= sections.length) return;

    glideTo(targetFor(sections[next]));
  }

  function onKey(e) {
    var down = e.key === "PageDown" || e.key === "ArrowDown" || (e.key === " " && !e.shiftKey);
    var up = e.key === "PageUp" || e.key === "ArrowUp" || (e.key === " " && e.shiftKey);
    if (!down && !up) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (animating) { e.preventDefault(); return; }
    if (sections.length < 2) return;
    var next = down ? currentIndex() + 1 : currentIndex() - 1;
    if (next < 0 || next >= sections.length) return;
    e.preventDefault();
    glideTo(targetFor(sections[next]));
  }

  collect();
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", collect, { passive: true });
  window.addEventListener("load", function () {
    setTimeout(collect, 300);
  });
})();
