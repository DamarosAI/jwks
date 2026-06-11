/* ============================================================
 * DAMAROS — doc-ui.js
 * Motion + wayfinding for the document pages, in the deck's grammar:
 *   · hero entrance: staggered rise (the deck's cap-line beat)
 *   · sections reveal once as they enter the viewport
 *   · reading-progress hairline under the nav
 *   · right-edge station rail: numbered ticks, scroll-spied,
 *     click to travel (the deck-dots, recast for a document)
 *   · card hover leans on the WebGL terrain (DocWorld.hover)
 * Reduced motion: reveals render instantly, jumps are instant.
 * ============================================================ */
(function () {
  document.documentElement.classList.add('js');
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var main = document.querySelector('main');
    if (!main) return;

    /* ---- rAF tween (CSS transitions are unreliable in some embeds;
       rAF is the same clock the world renders on) ---- */
    function tween(el, delaySec) {
      if (REDUCED) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      var t0 = null, D = 760;
      function step(now) {
        if (t0 === null) t0 = now + (delaySec || 0) * 1000;
        var k = (now - t0) / D;
        if (k < 0) { requestAnimationFrame(step); return; }
        k = Math.min(1, k);
        var e = 1 - Math.pow(1 - k, 3);
        el.style.opacity = e.toFixed(3);
        el.style.transform = 'translateY(' + (18 * (1 - e)).toFixed(2) + 'px)';
        if (k < 1) requestAnimationFrame(step);
        else { el.style.opacity = ''; el.style.transform = ''; }
      }
      requestAnimationFrame(step);
    }

    /* ---- hero entrance: stagger everything above the first section ---- */
    var heroEls = [].filter.call(main.children, function (el) {
      return el.tagName !== 'SECTION' && !el.classList.contains('divider');
    });
    heroEls.forEach(function (el, i) { tween(el, i * 0.09); });

    /* ---- reveal on scroll: sections + about-page prose ----
       NOTHING is pre-hidden: the tween hides+reveals only at the moment
       the observer fires (early, via bottom rootMargin, so it starts
       off-screen). If IO never fires, content is simply visible. */
    var sections = [].slice.call(document.querySelectorAll('section.doc'));
    var prose = [].slice.call(document.querySelectorAll('.a-prose > p'));
    var revealables = sections.concat(prose);
    if (!REDUCED && 'IntersectionObserver' in window) {
      var seen = new Set();
      // anything already in or near the viewport at load is part of the hero beat — skip it
      revealables.forEach(function (el) {
        if (el.getBoundingClientRect().top <= innerHeight * 1.15) seen.add(el);
      });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !seen.has(e.target)) {
            seen.add(e.target); io.unobserve(e.target);
            tween(e.target, 0);
          }
        });
      }, { rootMargin: '0px 0px 18% 0px', threshold: 0 });
      revealables.forEach(function (el) { if (!seen.has(el)) io.observe(el); });
    }

    /* ---- reading progress hairline ---- */
    var prog = document.createElement('div'); prog.className = 'doc-progress'; prog.setAttribute('aria-hidden', 'true');
    var pbar = document.createElement('span'); prog.appendChild(pbar); document.body.appendChild(prog);

    /* ---- station rail (only when the page has enough sections) ---- */
    var rail = null, btns = [];
    if (sections.length > 2) {
      rail = document.createElement('nav'); rail.className = 'doc-rail'; rail.setAttribute('aria-label', 'Sections');
      sections.forEach(function (s, i) {
        if (!s.id) s.id = 'doc-sec-' + i;
        var n = s.querySelector('.sl-n'), head = s.querySelector('.sec-head');
        var b = document.createElement('button'); b.type = 'button';
        b.setAttribute('aria-label', head ? head.textContent.trim() : ('Section ' + (i + 1)));
        var kk = document.createElement('span'); kk.className = 'rl-k';
        kk.textContent = head ? head.textContent.trim() : '';
        var num = document.createElement('span'); num.className = 'rl-n';
        num.textContent = n ? n.textContent.trim() : String(i + 1).padStart(2, '0');
        var tick = document.createElement('span'); tick.className = 'rl-t';
        b.appendChild(kk); b.appendChild(num); b.appendChild(tick);
        b.addEventListener('click', function () {
          var y = s.getBoundingClientRect().top + window.scrollY - 84;
          window.scrollTo({ top: Math.max(0, y), behavior: REDUCED ? 'auto' : 'smooth' });
        });
        rail.appendChild(b); btns.push(b);
      });
      document.body.appendChild(rail);
    }

    function spy() {
      if (!btns.length) return;
      var cur = 0;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= 180) cur = i;
      }
      btns.forEach(function (b, i) { b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    }
    function onScroll() {
      var max = document.documentElement.scrollHeight - innerHeight;
      pbar.style.width = (max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0) + '%';
      spy();
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();

    /* ---- card hover leans on the terrain (the deck's uHover verb) ---- */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var SEL = '.dual-card, .scard, .foil, .chain-step, .kv, .scopes';
      var hot = 0;
      document.addEventListener('pointerover', function (e) {
        var on = e.target.closest ? e.target.closest(SEL) : null;
        var v = on ? 1 : 0;
        if (v !== hot) { hot = v; if (window.DocWorld) window.DocWorld.hover(v); }
      }, { passive: true });
    }
  });
})();
