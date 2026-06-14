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
  var WARM = document.documentElement.classList.contains('nav-warm');
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

  var revealUntil = 0;
  if (RM) {
    caps.forEach(function (cap) { fit(cap); setState(cap, 'shown'); });
    window.DamarosCapIntro = { kick: function () {}, revealDuration: function () { return 0; }, get revealUntil() { return 0; } };
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
  var LINE_SETTLE = 380;   // cap-line opacity/transform transition must finish before travel unlocks

  function revealDuration(cap) {
    if (RM || !cap) return 0;
    if (WARM) return 120;
    var t = cap.querySelector('[data-type]');
    var lines = [].slice.call(cap.querySelectorAll('.cap-line'));
    var others = lines.filter(function (el) { return el !== t && !(t && el.contains(t)); });
    var headlineMs = 0;
    if (t) {
      var chars = [].slice.call(t.querySelectorAll('.rc'));
      var n = Math.max(chars.length, 1);
      var stagger = n <= 1 ? 0 : (REF_LAST_LOCK - START_DELAY - MIN_SCRAMBLE) / (n - 1);
      headlineMs = START_DELAY + MIN_SCRAMBLE + Math.max(0, n - 2) * stagger + LOCK_DUR * 0.4;
    }
    var floatMs = others.length ? (others.length - 1) * FLOAT_STAGGER : 0;
    return headlineMs + floatMs + LINE_SETTLE;
  }

  function armReveal(cap) {
    revealUntil = performance.now() + revealDuration(cap);
  }
  revealUntil = performance.now() + 6000;   // locked until hero arms on first activate

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

  function activateFast(cap) {
    active = cap;
    clearTimers();
    revealUntil = performance.now();
    var t = cap.querySelector('[data-type]');
    var lines = [].slice.call(cap.querySelectorAll('.cap-line'));
    var others = lines.filter(function (el) { return el !== t && !(t && el.contains(t)); });
    others.forEach(function (el) { el.classList.remove('on'); });
    if (t) {
      if (!t.querySelector('.rc[data-w]')) fit(cap);
      setState(cap, 'shown');
    }
    lines.forEach(function (el) { el.classList.add('on'); });
  }

  function activate(cap) {
    if (active === cap) return;
    if (WARM && !RM) { activateFast(cap); return; }
    active = cap;
    clearTimers();
    armReveal(cap);

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

    // reveal the headline's OWN cap-line container (e.g. the hero <h1> logo wraps the
    // [data-type] span, so it carries .cap-line opacity:0 until .on). Do it now, with
    // letters already in scramble state, so the container never flashes final text.
    var headLine = lines.filter(function (el) { return el === t || el.contains(t); })[0];
    if (headLine) headLine.classList.add('on');

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
  if (WARM && !RM) {
    caps.forEach(function (cap) { fit(cap); setState(cap, 'shown'); });
    revealUntil = performance.now();
  } else kick();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { layoutAll(true); });
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layoutAll(true); }, 160);
  });

  window.DamarosCapIntro = { kick: kick, revealDuration: revealDuration, get revealUntil() { return revealUntil; } };

  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || RM) return;
    var current = caps.filter(function (c) { return c.classList.contains('cap--active'); })[0];
    if (current) activateFast(current);
  });
  window.addEventListener('damaros:restore', function () {
    if (RM) return;
    var current = caps.filter(function (c) { return c.classList.contains('cap--active'); })[0];
    if (current) activateFast(current);
  });
})();
