/**
 * Shared section chevron scroll: fluid ease to vertically center the next section
 * (or pin under the nav when content is taller than the viewport).
 */
(function () {
  "use strict";

  function reduce() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function navOffset() {
    var nav = document.querySelector(".dm-float-nav");
    var h = nav ? nav.getBoundingClientRect().height : 52;
    return h + 16;
  }

  function resolveTarget(idOrEl) {
    if (!idOrEl) return null;
    if (typeof idOrEl !== "string") return idOrEl;
    // Cross-page: "index.html#close" → navigate instead
    if (idOrEl.indexOf("#") !== -1 && !/^#/.test(idOrEl)) {
      return { external: idOrEl };
    }
    var id = idOrEl.replace(/^#/, "");
    var section = document.getElementById(id);
    if (!section) return null;
    return section.querySelector(".dm-scroll-target") || section;
  }

  function targetYFor(el) {
    var rect = el.getBoundingClientRect();
    var top = rect.top + (window.scrollY || window.pageYOffset || 0);
    var height = rect.height;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var pad = navOffset();
    var usable = Math.max(240, vh - pad);
    var y;
    if (height <= usable * 0.92) {
      y = top - pad - (usable - height) / 2;
    } else {
      y = top - pad - Math.min(28, usable * 0.04);
    }
    var max = Math.max(
      0,
      (document.documentElement.scrollHeight || document.body.scrollHeight) - vh
    );
    return Math.max(0, Math.min(y, max));
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  var anim = null;
  function smoothTo(y) {
    if (reduce()) {
      window.scrollTo(0, y);
      return;
    }
    if (anim) cancelAnimationFrame(anim);
    var start = window.scrollY || window.pageYOffset || 0;
    var dist = y - start;
    if (Math.abs(dist) < 1) return;
    var dur = Math.min(980, Math.max(480, Math.abs(dist) * 0.62));
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dist * easeInOutCubic(p));
      if (p < 1) anim = requestAnimationFrame(frame);
      else anim = null;
    }
    anim = requestAnimationFrame(frame);
  }

  function go(idOrEl, pushHash) {
    var resolved = resolveTarget(idOrEl);
    if (!resolved) return false;
    if (resolved.external) {
      window.location.href = resolved.external;
      return true;
    }
    var y = targetYFor(resolved);
    smoothTo(y);
    var id = typeof idOrEl === "string" ? idOrEl.replace(/^#/, "") : resolved.id;
    if (pushHash !== false && id && history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
    return true;
  }

  window.dmScrollCenter = go;

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("[data-scroll-center]");
    if (!a) return;
    var id = a.getAttribute("data-scroll-center");
    if (!id) return;
    e.preventDefault();
    go(id, true);
  });

  function hashGo() {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id || !document.getElementById(id)) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        go(id, false);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hashGo);
  else hashGo();
  window.addEventListener("hashchange", hashGo);
})();
