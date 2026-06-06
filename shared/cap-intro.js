/* ============================================================
 * Damaros — caption intro choreography + headline auto-fit.
 *
 * SCRAMBLE-RESOLVE: when a station becomes active its headline tumbles through
 * random letters (same capitalization, letters/digits only — never symbols)
 * and locks into place left to right. Letters hold a fixed (fractional-px)
 * width so the word never reflows or bounces. Then the tagline/kicker/cards
 * float in beneath/beside it.
 *
 * AUTO-FIT: every headline is scaled down if it would exceed its column, so
 * nothing is ever clipped — on any laptop size or mobile. Re-runs on resize
 * and once web fonts are ready.
 * ============================================================ */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var caps = [].slice.call(document.querySelectorAll('[data-cap]'));

  // prep: split each headline into per-letter spans (final letter inside, so
  // each can be measured). Positions are locked later by fit().
  caps.forEach(function (cap) {
    var t = cap.querySelector('[data-type]');
    if (!t) return;
    var full = t.textContent;
    t.setAttribute('data-full', full);
    t.textContent = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < full.length; i++) {
      var ch = full[i];
      var s = document.createElement('span');
      s.className = 'rc';
      s.setAttribute('data-ch', ch);
      if (ch === ' ') { s.innerHTML = '&nbsp;'; s.setAttribute('data-space', '1'); }
      else { s.textContent = ch; }
      frag.appendChild(s);
    }
    t.appendChild(frag);
  });

  /* ---- auto-fit: scale a headline down so it never exceeds its column ---- */
  function fit(cap) {
    var t = cap.querySelector('[data-type]');
    if (!t) return;
    var container = t.closest('.cap-head') || t.closest('.cap');
    if (!container) return;
    var avail = container.clientWidth;
    if (!avail) return;
    var spans = [].slice.call(t.querySelectorAll('.rc'));

    t.style.fontSize = '';
    var base = parseFloat(getComputedStyle(t).fontSize) || 16;
    // measure natural width with final letters and no locked widths
    spans.forEach(function (s) {
      s.style.width = '';
      if (s.getAttribute('data-space')) s.innerHTML = '&nbsp;';
      else s.textContent = s.getAttribute('data-ch');
    });
    void t.offsetWidth;
    var natural = 0;
    spans.forEach(function (s) { natural += s.getBoundingClientRect().width; });

    var scale = 1;
    if (natural > avail * 0.96) scale = (avail * 0.96) / natural;
    t.style.fontSize = (base * scale) + 'px';

    // lock each letter's (fractional) width at the final size → zero bounce
    void t.offsetWidth;
    spans.forEach(function (s) {
      var w = s.getBoundingClientRect().width;
      if (w) { s.style.width = w + 'px'; s.setAttribute('data-w', String(w)); }
    });
  }

  function setState(cap, state) { // 'hidden' | 'shown'
    var t = cap.querySelector('[data-type]');
    if (!t) return;
    [].forEach.call(t.querySelectorAll('.rc'), function (s) {
      s.classList.remove('scram');
      if (state === 'shown') {
        s.classList.add('in');
        if (s.getAttribute('data-space')) s.innerHTML = '&nbsp;'; else s.textContent = s.getAttribute('data-ch');
      } else {
        s.classList.remove('in');
      }
    });
  }

  function layoutAll(keepActive) {
    caps.forEach(function (cap) {
      if (!cap.querySelector('[data-type]')) return;
      fit(cap);
      setState(cap, (keepActive && cap.classList.contains('cap--active')) ? 'shown' : 'hidden');
    });
  }

  if (RM) {
    caps.forEach(function (cap) { fit(cap); setState(cap, 'shown'); });
    return;
  }

  var START_DELAY = 75;
  var MIN_SCRAMBLE = 130;
  var STAGGER = 29;          // per-letter cadence for the hero "Damaros" lockup (7 chars)
  var SCRAMBLE_MS = 31;
  var LOCK_DUR = 210;
  var REF_LAST_LOCK = START_DELAY + MIN_SCRAMBLE + 6 * STAGGER; // when "Damaros" fully resolves
  var REF_DONE = START_DELAY + MIN_SCRAMBLE + (7 - 2) * STAGGER + LOCK_DUR * 0.4; // tagline float-in beat
  var FLOAT_STAGGER = 48;

  function randCh(ch) {
    if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(65 + (Math.random() * 26 | 0));
    if (ch >= 'a' && ch <= 'z') return String.fromCharCode(97 + (Math.random() * 26 | 0));
    if (ch >= '0' && ch <= '9') return String.fromCharCode(48 + (Math.random() * 10 | 0));
    return ch;
  }

  var active = null, timers = [], scrambleTimer = null, lastSwap = 0;
  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    if (scrambleTimer) { cancelAnimationFrame(scrambleTimer); scrambleTimer = null; }
  }

  function activate(cap) {
    if (active === cap) return;
    active = cap;
    clearTimers();

    var t = cap.querySelector('[data-type]');
    var lines = [].slice.call(cap.querySelectorAll('.cap-line'));
    var others = lines.filter(function (el) { return el !== t && !(t && el.contains(t)); });
    others.forEach(function (el) { el.classList.remove('on'); });

    if (!t) { floatIn(others, cap); return; }

    if (!t.querySelector('.rc[data-w]')) fit(cap);
    var chars = [].slice.call(t.querySelectorAll('.rc'));
    var locked = [];
    var stagger = chars.length <= 1 ? 0 : (REF_LAST_LOCK - START_DELAY - MIN_SCRAMBLE) / (chars.length - 1);

    chars.forEach(function (s, i) {
      var space = s.getAttribute('data-space');
      var fin = s.getAttribute('data-ch');
      s.classList.remove('in');
      s.classList.add('scram');
      locked[i] = false;
      if (space) s.innerHTML = '&nbsp;'; else s.textContent = randCh(fin);

      var lockAt = START_DELAY + MIN_SCRAMBLE + i * stagger;
      timers.push(setTimeout(function () {
        if (active !== cap) return;
        locked[i] = true;
        s.classList.remove('scram');
        s.classList.add('in');
        if (space) s.innerHTML = '&nbsp;'; else s.textContent = fin;
      }, lockAt));
    });

    (function loop(ts) {
      if (active !== cap) return;
      scrambleTimer = requestAnimationFrame(loop);
      if (ts - lastSwap < SCRAMBLE_MS) return;
      lastSwap = ts;
      var anyLeft = false;
      for (var i = 0; i < chars.length; i++) {
        if (locked[i] || chars[i].getAttribute('data-space')) continue;
        anyLeft = true;
        chars[i].textContent = randCh(chars[i].getAttribute('data-ch'));
      }
      if (!anyLeft && scrambleTimer) { cancelAnimationFrame(scrambleTimer); scrambleTimer = null; }
    })(performance.now());

    var done = REF_DONE;
    timers.push(setTimeout(function () { if (active === cap) floatIn(others, cap); }, done));
  }

  function floatIn(els, cap) {
    els.forEach(function (el, idx) {
      timers.push(setTimeout(function () { if (active === cap) el.classList.add('on'); }, idx * FLOAT_STAGGER));
    });
  }

  function deactivate(cap) {
    setState(cap, 'hidden');
    if (active === cap) { active = null; clearTimers(); }
  }

  var obs = new MutationObserver(function (muts) {
    for (var k = 0; k < muts.length; k++) {
      var cap = muts[k].target;
      if (cap.classList.contains('cap--active')) activate(cap);
      else deactivate(cap);
    }
  });
  caps.forEach(function (cap) { obs.observe(cap, { attributes: true, attributeFilter: ['class'] }); });

  function kick() {
    var current = caps.filter(function (c) { return c.classList.contains('cap--active'); })[0];
    if (current) { active = null; activate(current); }
  }

  // initial layout (fallback metrics), refit when fonts land, refit on resize
  layoutAll(false);
  kick();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { layoutAll(true); });
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layoutAll(true); }, 160);
  });

  window.DamarosCapIntro = { kick: kick };
})();
