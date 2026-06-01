/* Pause canvas RAF loops when tab hidden or element off-screen. */
(function (global) {
  function loop(opts) {
    var rafId = 0, running = true, tabVisible = !document.hidden, inView = true;
    var root = opts.root || null;

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
      }, { root: null, rootMargin: "100px 0px", threshold: 0 }).observe(root);
    }

    return { start: kick, stop: stop, kick: kick };
  }

  global.DamarosAnim = { loop: loop };
})(typeof window !== "undefined" ? window : this);
