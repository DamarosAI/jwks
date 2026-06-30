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

  var sections = [];
  var animating = false;
  var lockUntil = 0;
  var pendingDir = 0;

  // JS owns scrolling now; drop CSS snap so it can't fight intra-section steps.
  document.documentElement.style.scrollSnapType = "none";

  function collect() {
    sections = Array.prototype.slice.call(
      document.querySelectorAll(".dm-site section[data-screen-label]")
    );
    sections.forEach(function (s) {
      s.style.scrollSnapAlign = "none";
      s.style.scrollSnapStop = "normal";
    });
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

  // Resting scroll position when entering a section from above. Mirrors scrollCenter().
  function centerTarget(el) {
    var r = el.getBoundingClientRect();
    var elTop = r.top + window.scrollY;
    var top = elTop - Math.max(HEADER, (window.innerHeight - r.height) / 2);
    return Math.max(0, Math.min(top, maxScroll()));
  }

  // Resting scroll position when re-entering a section from below (scroll up).
  // Tall sections land at their bottom stop; short sections stay centered.
  function enterFromBelow(el) {
    var r = el.getBoundingClientRect();
    var top = absTop(el);
    var bottom = top + r.height;
    var vh = window.innerHeight;
    if (r.height + HEADER <= vh) return centerTarget(el);
    return Math.max(top - HEADER, Math.min(bottom - vh, maxScroll()));
  }

  function drainPending() {
    if (!pendingDir) return;
    var dir = pendingDir;
    pendingDir = 0;
    requestAnimationFrame(function () {
      advance(dir, null);
    });
  }

  function finishGlide(now, html, prevBehavior) {
    animating = false;
    lockUntil = now + 220;
    html.style.scrollBehavior = prevBehavior;
    drainPending();
  }

  function glideTo(target) {
    target = Math.max(0, Math.min(target, maxScroll()));
    var html = document.documentElement;
    var prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    if (reduced.matches || DURATION === 0) {
      window.scrollTo(0, target);
      html.style.scrollBehavior = prevBehavior;
      lockUntil = performance.now() + 160;
      drainPending();
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
        finishGlide(now, html, prevBehavior);
      }
    }
    requestAnimationFrame(frame);
  }

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

  function advance(dir, e) {
    if (e && innerHandles(e.target, dir)) return false;
    if (sections.length < 2) return false;

    var idx = currentIndex();
    var sec = sections[idx];
    var top = absTop(sec);
    var bottom = top + sec.getBoundingClientRect().height;
    var viewTop = window.scrollY;
    var viewBottom = viewTop + window.innerHeight;
    var stepPx = (window.innerHeight - HEADER) * STEP_RATIO;
    var rest = centerTarget(sec);

    if (dir > 0) {
      if (bottom - viewBottom > REMAIN_MIN) {
        if (e) e.preventDefault();
        glideTo(Math.min(viewTop + stepPx, bottom - window.innerHeight));
        return true;
      }
      if (idx < sections.length - 1) {
        if (e) e.preventDefault();
        glideTo(centerTarget(sections[idx + 1]));
        return true;
      }
    } else {
      if (viewTop - rest > REMAIN_MIN) {
        if (e) e.preventDefault();
        glideTo(Math.max(viewTop - stepPx, rest));
        return true;
      }
      if (idx > 0) {
        if (e) e.preventDefault();
        glideTo(enterFromBelow(sections[idx - 1]));
        return true;
      }
    }
    return false;
  }

  function onWheel(e) {
    if (e.ctrlKey) return;
    var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (!dir) return;

    var now = performance.now();
    if (animating || now < lockUntil) {
      e.preventDefault();
      pendingDir = dir;
      lockUntil = Math.max(lockUntil, now + 120);
      return;
    }

    advance(dir, e);
  }

  collect();
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", collect, { passive: true });
  window.addEventListener("load", function () {
    setTimeout(collect, 300);
  });
})();
