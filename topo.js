/**
 * Subtle topo parallax for hero / close.
 * Pointer follow + scroll drift + click/tap nudge.
 */
(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var MAX = 20;
  var SCALE = 1.12;
  var state = [];
  var raf = 0;
  var ptrX = 0;
  var ptrY = 0;
  var hasPtr = false;

  function collect() {
    var nodes = document.querySelectorAll(".dm-site .dm-topo, .dm-topo");
    var next = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var stage = el.querySelector(".dm-topo-stage") || el;
      var prev = null;
      for (var j = 0; j < state.length; j++) {
        if (state[j].el === el) {
          prev = state[j];
          break;
        }
      }
      next.push(
        prev || {
          el: el,
          stage: stage,
          x: 0,
          y: 0,
          tx: 0,
          ty: 0,
          nudgeX: 0,
          nudgeY: 0
        }
      );
      if (prev) prev.stage = stage;
    }
    state = next;
    return state.length > 0;
  }

  function clamp(v, lim) {
    return Math.max(-lim, Math.min(lim, v));
  }

  function tick() {
    raf = 0;
    var moving = false;
    for (var i = 0; i < state.length; i++) {
      var s = state[i];
      if (!s.el.isConnected) continue;
      var r = s.el.getBoundingClientRect();
      var visible = r.bottom > -40 && r.top < window.innerHeight + 40;
      if (!visible) continue;

      var scrollOff = clamp((r.top + r.height * 0.5 - window.innerHeight * 0.5) * -0.045, 14);
      var px = 0;
      var py = 0;
      if (hasPtr) {
        px = clamp(((ptrX - (r.left + r.width * 0.5)) / Math.max(r.width, 1)) * -24, MAX);
        py = clamp(((ptrY - (r.top + r.height * 0.5)) / Math.max(r.height, 1)) * -18, MAX);
      }

      s.tx = px + s.nudgeX;
      s.ty = py + scrollOff + s.nudgeY;
      s.x += (s.tx - s.x) * 0.1;
      s.y += (s.ty - s.y) * 0.1;

      if (Math.abs(s.nudgeX) > 0.05) s.nudgeX *= 0.9;
      else s.nudgeX = 0;
      if (Math.abs(s.nudgeY) > 0.05) s.nudgeY *= 0.9;
      else s.nudgeY = 0;

      if (Math.abs(s.tx - s.x) > 0.08 || Math.abs(s.ty - s.y) > 0.08 || s.nudgeX || s.nudgeY) {
        moving = true;
      }

      s.stage.style.transform =
        "translate3d(" + s.x.toFixed(2) + "px," + s.y.toFixed(2) + "px,0) scale(" + SCALE + ")";
    }
    if (moving || hasPtr) raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function onPointerMove(e) {
    if (e.pointerType === "touch" && e.buttons === 0 && e.type === "pointermove") {
      /* still track for drag feel */
    }
    hasPtr = e.pointerType !== "touch";
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      hasPtr = true;
      ptrX = e.clientX;
      ptrY = e.clientY;
      kick();
    }
  }

  function onScroll() {
    kick();
  }

  function onTap(e) {
    if (!state.length && !collect()) return;
    for (var i = 0; i < state.length; i++) {
      var s = state[i];
      if (!s.el.isConnected) continue;
      var r = s.el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) continue;
      var px = ((e.clientX - (r.left + r.width * 0.5)) / Math.max(r.width, 1)) * -16;
      var py = ((e.clientY - (r.top + r.height * 0.5)) / Math.max(r.height, 1)) * -12;
      s.nudgeX = clamp(px, 16);
      s.nudgeY = clamp(py, 12);
      kick();
    }
  }

  function boot() {
    collect();
    kick();
  }

  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerdown", onTap, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    collect();
    kick();
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", boot);

  // DC remounts template content — rebind when .dm-topo appears/changes
  var tries = 0;
  var poll = setInterval(function () {
    tries += 1;
    var ok = collect();
    if (ok) kick();
    if (ok && tries > 8) clearInterval(poll);
    if (tries > 40) clearInterval(poll);
  }, 250);
})();
