/* Intercept same-origin navigations with a short exit fade; restore on bfcache. */
(function () {
  var LEAVE_MS = 200;
  var ENTER_FALLBACK_MS = 720;
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markWarm() {
    try { sessionStorage.setItem('damaros-warm', '1'); } catch (e) { /* private mode */ }
    document.documentElement.classList.add('nav-warm');
  }

  function revealEnter() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add('page-enter-ready');
      });
    });
  }

  function restoreFromCache() {
    document.body.classList.remove('page-leaving');
    document.documentElement.classList.add('page-enter-ready');
    document.body.classList.add('world-ready');
    document.body.classList.remove('doc-intro', 'intro-hold');
    document.documentElement.classList.remove('intro-hold');
    try { window.dispatchEvent(new Event('damaros:restore')); } catch (e) { /* old browsers */ }
  }

  function isInternalLink(a, e) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
    try {
      var u = new URL(a.href, location.href);
      return u.origin === location.origin && u.pathname !== location.pathname;
    } catch (err) { return false; }
  }

  function leaveThen(url) {
    if (REDUCED) { markWarm(); location.href = url; return; }
    document.body.classList.add('page-leaving');
    markWarm();
    setTimeout(function () { location.href = url; }, LEAVE_MS);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!isInternalLink(a, e)) return;
    e.preventDefault();
    leaveThen(a.href);
  }, true);

  window.addEventListener('pageshow', function (e) {
    document.body.classList.remove('page-leaving');
    if (e.persisted) restoreFromCache();
    else document.documentElement.classList.add('page-enter-ready');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealEnter);
  } else revealEnter();

  setTimeout(function () {
    document.documentElement.classList.add('page-enter-ready');
  }, ENTER_FALLBACK_MS);

  // Hard anti-brick safety net: the deck ships with intro-hold on <html>/<body>
  // (overflow:hidden, caps hidden) and relies on the space.js module to lift it.
  // If that module ever stalls or fails to execute on a reload, the page would
  // stay frozen. This guarantees the lock is released regardless.
  setTimeout(function () {
    document.documentElement.classList.remove('intro-hold');
    if (document.body) {
      document.body.classList.remove('intro-hold');
      document.body.classList.add('world-ready');
    }
  }, 4000);
})();
