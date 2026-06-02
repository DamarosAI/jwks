/* Pause canvas RAF loops when off-screen; one-shot scroll reveals via IO + rAF. */
(function (global) {
  function isMobile() {
    return matchMedia("(hover: none), (pointer: coarse)").matches || window.innerWidth <= 900;
  }

  function perf() {
    var mobile = isMobile();
    return {
      mobile: mobile,
      dpr: mobile ? 1 : Math.min(2, window.devicePixelRatio || 1),
      glow: mobile ? 0 : 1
    };
  }

  function loop(opts) {
    var rafId = 0, running = true, tabVisible = !document.hidden, inView = true;
    var root = opts.root || null;
    var margin = opts.rootMargin || (isMobile() ? "40px 0px" : "100px 0px");

    function active() {
      return running && tabVisible && inView && !opts.reduced;
    }

    function tick(now) {
      rafId = 0;
      if (!active()) return;
      opts.onFrame(now);
      rafId = requestAnimationFrame(tick);
    }

    function kick() {
      if (!rafId && active()) rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    document.addEventListener("visibilitychange", function () {
      tabVisible = !document.hidden;
      if (tabVisible) kick();
    });

    if (root && "IntersectionObserver" in global) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) kick();
      }, { root: null, rootMargin: margin, threshold: 0 }).observe(root);
    }

    return { start: kick, stop: stop, kick: kick };
  }

  function inViewport(el, pad) {
    pad = pad == null ? 0.04 : pad;
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * (1 - pad) && r.bottom > vh * pad;
  }

  function revealOnScroll(opts) {
    opts = opts || {};
    var selector = opts.selector || ".flow-in, .draw";
    var els = [].slice.call(document.querySelectorAll(selector));
    if (!els.length) return;

    var reduced = opts.reduced;
    if (reduced == null) reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    if (!("IntersectionObserver" in global)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var pending = new Set();

    function activate(el) {
      if (el.classList.contains("in") || pending.has(el)) return;
      pending.add(el);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          pending.delete(el);
          el.classList.add("in");
        });
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.08) return;
        activate(entry.target);
        io.unobserve(entry.target);
      });
    }, { root: null, rootMargin: "0px 0px -5% 0px", threshold: [0, 0.08, 0.15] });

    els.forEach(function (el) {
      if (inViewport(el)) activate(el);
      else io.observe(el);
    });
  }

  global.DamarosAnim = { loop: loop, isMobile: isMobile, perf: perf, revealOnScroll: revealOnScroll };
})(typeof window !== "undefined" ? window : this);
