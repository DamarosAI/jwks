/**
 * Subtle topo parallax for hero / close sections.
 * Pointer: soft follow. Mobile: scroll drift + tap nudge.
 */
(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".dm-topo"));
  if (!nodes.length) return;

  var state = nodes.map(function (el) {
    var stage = el.querySelector(".dm-topo-stage") || el;
    return {
      el: el,
      stage: stage,
      tx: 0,
      ty: 0,
      cx: 0,
      cy: 0,
      scrollY: 0
    };
  });

  var raf = 0;
  function tick() {
    raf = 0;
    for (var i = 0; i < state.length; i++) {
      var s = state[i];
      s.tx += (s.cx - s.tx) * 0.08;
      s.ty += (s.cy - s.ty) * 0.08;
      var x = s.tx + (fine ? 0 : s.scrollY);
      var y = s.ty + (fine ? 0 : s.scrollY * 0.35);
      if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05) {
        x = 0;
        y = 0;
      }
      s.stage.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) scale(1.12)";
    }
    var moving = state.some(function (s) {
      return Math.abs(s.cx - s.tx) > 0.08 || Math.abs(s.cy - s.ty) > 0.08;
    });
    if (moving) raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function setTarget(s, nx, ny) {
    s.cx = Math.max(-18, Math.min(18, nx));
    s.cy = Math.max(-14, Math.min(14, ny));
    kick();
  }

  if (fine) {
    document.addEventListener(
      "pointermove",
      function (e) {
        for (var i = 0; i < state.length; i++) {
          var s = state[i];
          var r = s.el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          var px = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 1);
          var py = (e.clientY - (r.top + r.height / 2)) / Math.max(r.height, 1);
          setTarget(s, px * -22, py * -16);
        }
      },
      { passive: true }
    );
  } else {
    var onScroll = function () {
      for (var i = 0; i < state.length; i++) {
        var s = state[i];
        var r = s.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        var mid = r.top + r.height / 2 - window.innerHeight / 2;
        s.scrollY = Math.max(-12, Math.min(12, mid * -0.04));
        kick();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.addEventListener(
      "pointerdown",
      function (e) {
        for (var i = 0; i < state.length; i++) {
          var s = state[i];
          var r = s.el.getBoundingClientRect();
          if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) continue;
          var px = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 1);
          var py = (e.clientY - (r.top + r.height / 2)) / Math.max(r.height, 1);
          setTarget(s, px * -14, py * -10);
          (function (target) {
            setTimeout(function () {
              target.cx = 0;
              target.cy = 0;
              kick();
            }, 420);
          })(s);
        }
      },
      { passive: true }
    );
  }
})();
