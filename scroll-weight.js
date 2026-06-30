/*
 * Weighted section scrolling.
 * Each wheel gesture advances one "stop" — either to the next labeled
 * section, or one weighted step within a section taller than the viewport.
 * A continuous trackpad fling is collapsed into a single advance, so the
 * page cannot be sped through in one motion. Honors reduced-motion, leaves
 * touch / coarse-pointer / narrow viewports on native scrolling, and never
 * hijacks gestures that belong to an inner scrollable panel.
 */
(function () {
  var coarse = window.matchMedia("(max-width:760px),(pointer:coarse)");
  if (coarse.matches) return;

  var reduced = window.matchMedia("(prefers-reduced-motion:reduce)");
  var HEADER = 62; // sticky header height (also CSS scroll-padding-top)
  var DURATION = 760; // luxury weight: slow, eased glide between stops
  var STEP_RATIO = 0.88; // viewport fraction per in-section step
  var REMAIN_MIN = 130; // ignore leftover smaller than this -> jump to neighbor
  var EPS = 6;

  var sections = [];
  var animating = false;
  var lockUntil = 0;

  // JS owns scrolling now; drop CSS snap so it can't fight intra-section steps.
  document.documentElement.style.scrollSnapType = "none";

  function collect() {
    sections = Array.prototype.slice.call(
      document.querySelectorAll(".dm-site section[data-screen-label]")
    );
  }

  function absTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function maxScroll() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Resting scroll position for a section. Mirrors scrollCenter() in the page:
  // a section shorter than the viewport is centered vertically; a section taller
  // than the viewport is pinned just below the sticky header so it can be stepped
  // through. Keeps wheel stops identical to the chevron buttons.
  function centerTarget(el) {
    var r = el.getBoundingClientRect();
    var elTop = r.top + window.scrollY;
    var top = elTop - Math.max(HEADER, (window.innerHeight - r.height) / 2);
    return Math.max(0, Math.min(top, maxScroll()));
  }

  function glideTo(target) {
    target = Math.max(0, Math.min(target, maxScroll()));
    var html = document.documentElement;
    var prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto"; // override CSS smooth for frame-precise control

    if (reduced.matches || DURATION === 0) {
      window.scrollTo(0, target);
      html.style.scrollBehavior = prevBehavior;
      lockUntil = performance.now() + 160;
      return;
    }

    animating = true;
    var startY = window.scrollY;
    var dist = target - startY;
    var startT = performance.now();

    function frame(now) {
      var p = Math.min(1, (now - startT) / DURATION);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        animating = false;
        lockUntil = now + 220;
        html.style.scrollBehavior = prevBehavior;
      }
    }
    requestAnimationFrame(frame);
  }

  // Section currently owning the viewport = the one whose mid-line sits closest
  // to the viewport mid-line. Robust whether the section is centered (short) or
  // pinned to the top and being stepped through (tall).
  function currentIndex() {
    var mid = window.scrollY + window.innerHeight / 2;
    var idx = 0;
    var best = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      var center = r.top + window.scrollY + r.height / 2;
      var dist = Math.abs(center - mid);
      if (dist < best) {
        best = dist;
        idx = i;
      }
    }
    return idx;
  }

  // Let inner scrollable regions (demo panels, lists) keep their own gesture.
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
    var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (!dir) return;

    var now = performance.now();
    if (animating || now < lockUntil) {
      // Keep the lock alive while a fling's inertia keeps firing events,
      // so one continuous motion only ever advances a single stop.
      e.preventDefault();
      lockUntil = Math.max(lockUntil, now + 120);
      return;
    }

    if (innerHandles(e.target, dir)) return;
    if (sections.length < 2) return;

    var idx = currentIndex();
    var sec = sections[idx];
    var top = absTop(sec);
    var bottom = top + sec.getBoundingClientRect().height;
    var viewTop = window.scrollY;
    var viewBottom = viewTop + window.innerHeight;
    var stepPx = (window.innerHeight - HEADER) * STEP_RATIO;

    if (dir > 0) {
      // Step through a section taller than the viewport before leaving it,
      // otherwise glide to the next section's centered resting position.
      if (bottom - viewBottom > REMAIN_MIN) {
        e.preventDefault();
        glideTo(Math.min(viewTop + stepPx, bottom - window.innerHeight));
      } else if (idx < sections.length - 1) {
        e.preventDefault();
        glideTo(centerTarget(sections[idx + 1]));
      }
    } else {
      if (viewTop - (top - HEADER) > REMAIN_MIN) {
        e.preventDefault();
        glideTo(Math.max(viewTop - stepPx, top - HEADER));
      } else if (idx > 0) {
        e.preventDefault();
        glideTo(centerTarget(sections[idx - 1]));
      }
    }
  }

  collect();
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", collect, { passive: true });
  window.addEventListener("load", function () {
    setTimeout(collect, 300);
  });
})();
