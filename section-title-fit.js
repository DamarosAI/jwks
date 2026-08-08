/**
 * Fit section headlines. Prefer one line when the full sentence fits.
 * Two lines only when needed, with a near-even word break. Steel span
 * stays on the emphasis clause (original second segment, or second line).
 */
(function () {
  var SEL = "h2.dm-section-title";
  var MIN = 18;
  var raf = 0;
  var armed = false;
  // Second line may be at most this much shorter/longer than first (ratio).
  var BALANCE = 0.42;

  var CURVE = [
    [320, 24],
    [400, 28],
    [640, 36],
    [900, 46],
    [1280, 52],
    [1440, 56]
  ];

  function maxForViewport() {
    var w = window.innerWidth || 1024;
    if (w <= CURVE[0][0]) return CURVE[0][1];
    if (w >= CURVE[CURVE.length - 1][0]) return CURVE[CURVE.length - 1][1];
    for (var i = 1; i < CURVE.length; i++) {
      var a = CURVE[i - 1];
      var b = CURVE[i];
      if (w <= b[0]) {
        var t = (w - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return CURVE[CURVE.length - 1][1];
  }

  var reduced = false;
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function injectTransitionStyle() {
    if (document.getElementById("dm-section-title-fit-style")) return;
    var st = document.createElement("style");
    st.id = "dm-section-title-fit-style";
    st.textContent =
      "h2.dm-section-title{" +
      "transition:font-size 260ms cubic-bezier(0.22,1,0.36,1);}" +
      "@media (prefers-reduced-motion:reduce){" +
      "h2.dm-section-title{transition:none;}}";
    (document.head || document.documentElement).appendChild(st);
  }

  function contentWidth(el) {
    var node = el;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains("dm-scroll-target")) {
        return node.clientWidth;
      }
      node = node.parentElement;
    }
    return el.clientWidth;
  }

  function sharedWidth(nodes) {
    var best = 0;
    for (var i = 0; i < nodes.length; i++) {
      var w = contentWidth(nodes[i]);
      if (w > best) best = w;
    }
    return best || (window.innerWidth || 1024);
  }

  function parseTitle(el) {
    if (el.__dmTitleParts) return el.__dmTitleParts;
    var steelEl = el.querySelector(".dm-section-title__steel");
    var steel = steelEl ? steelEl.textContent.replace(/\s+/g, " ").trim() : "";
    var clone = el.cloneNode(true);
    var cloneSteel = clone.querySelector(".dm-section-title__steel");
    if (cloneSteel) cloneSteel.replaceWith(document.createTextNode(cloneSteel.textContent));
    clone.querySelectorAll("br").forEach(function (br) {
      br.replaceWith(document.createTextNode(" "));
    });
    var full = clone.textContent.replace(/\s+/g, " ").trim();
    var ink = full;
    if (steel && full.slice(-steel.length) === steel) {
      ink = full.slice(0, full.length - steel.length).replace(/\s+$/, "");
    }
    el.__dmTitleParts = { ink: ink, steel: steel, full: full };
    return el.__dmTitleParts;
  }

  function renderOne(el, parts) {
    el.classList.add("dm-section-title--one");
    el.classList.remove("dm-section-title--two");
    el.innerHTML = "";
    el.appendChild(document.createTextNode(parts.ink + (parts.steel ? " " : "")));
    if (parts.steel) {
      var span = document.createElement("span");
      span.className = "dm-section-title__steel";
      span.textContent = parts.steel;
      el.appendChild(span);
    }
  }

  function renderTwo(el, line1, line2) {
    el.classList.add("dm-section-title--two");
    el.classList.remove("dm-section-title--one");
    el.innerHTML = "";
    el.appendChild(document.createTextNode(line1));
    el.appendChild(document.createElement("br"));
    var span = document.createElement("span");
    span.className = "dm-section-title__steel";
    span.textContent = line2;
    el.appendChild(span);
  }

  function balancedBreak(full, preferredSteel) {
    var words = full.split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;
    var best = null;
    var mid = full.length / 2;
    for (var i = 1; i < words.length; i++) {
      var left = words.slice(0, i).join(" ");
      var right = words.slice(i).join(" ");
      var ratio = Math.abs(left.length - right.length) / Math.max(left.length, right.length, 1);
      if (ratio > BALANCE) continue;
      var score = Math.abs(left.length - mid) + ratio * 40;
      // Prefer keeping the original steel clause intact on line 2 when possible.
      if (preferredSteel && right === preferredSteel) score -= 12;
      if (!best || score < best.score) best = { left: left, right: right, score: score, ratio: ratio };
    }
    return best;
  }

  function measureFits(el, width, size) {
    var prevSize = el.style.fontSize;
    var prevWidth = el.style.width;
    var prevMax = el.style.maxWidth;
    el.style.setProperty("font-size", size + "px", "important");
    el.style.setProperty("width", width + "px", "important");
    el.style.setProperty("max-width", width + "px", "important");
    var ok = el.scrollWidth <= width + 0.5;
    if (prevSize) el.style.setProperty("font-size", prevSize, "important");
    else el.style.removeProperty("font-size");
    if (prevWidth) el.style.width = prevWidth;
    else el.style.removeProperty("width");
    if (prevMax) el.style.maxWidth = prevMax;
    else el.style.removeProperty("max-width");
    return ok;
  }

  function bestSize(el, width, hi) {
    if (measureFits(el, width, hi)) return hi;
    var lo = MIN;
    var best = MIN;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2;
      if (measureFits(el, width, mid)) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return best;
  }

  function layoutTitle(el, width, hi) {
    var parts = parseTitle(el);
    renderOne(el, parts);
    if (measureFits(el, width, Math.max(MIN, hi * 0.92))) {
      return bestSize(el, width, hi);
    }
    var br = balancedBreak(parts.full, parts.steel);
    if (br) {
      renderTwo(el, br.left, br.right);
      return bestSize(el, width, hi);
    }
    // Unbalanced fallback: keep original steel on line 2 if present.
    if (parts.steel && parts.ink) {
      renderTwo(el, parts.ink, parts.steel);
      return bestSize(el, width, hi);
    }
    renderOne(el, parts);
    return bestSize(el, width, hi);
  }

  function applySize(el, target) {
    var prev = el.style.fontSize;
    el.style.transition = "none";
    if (armed && !reduced && prev && prev !== target) {
      el.style.setProperty("font-size", prev, "important");
      void el.offsetWidth;
      el.style.transition = "";
      el.style.setProperty("font-size", target, "important");
    } else {
      el.style.transition = "";
      el.style.setProperty("font-size", target, "important");
    }
  }

  function fitAll() {
    raf = 0;
    var nodes = document.querySelectorAll(SEL);
    if (!nodes.length) return;

    var width = sharedWidth(nodes);
    var hi = maxForViewport();
    var sizes = [];
    var shared = hi;

    for (var i = 0; i < nodes.length; i++) {
      var size = layoutTitle(nodes[i], width, hi);
      sizes.push(size);
      if (size < shared) shared = size;
    }

    var target = shared.toFixed(2) + "px";
    for (var j = 0; j < nodes.length; j++) applySize(nodes[j], target);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fitAll);
  }

  function boot() {
    injectTransitionStyle();
    fitAll();
    requestAnimationFrame(function () { armed = true; });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
    setTimeout(schedule, 120);
    setTimeout(schedule, 480);
  }

  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", function () {
    setTimeout(schedule, 80);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", schedule);

  var tries = 0;
  var poll = setInterval(function () {
    tries += 1;
    if (document.querySelector(SEL)) {
      schedule();
      if (tries > 6) clearInterval(poll);
    }
    if (tries > 40) clearInterval(poll);
  }, 250);
})();
