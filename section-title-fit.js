/**
 * Fit section headlines. Prefer one line when the full sentence fits.
 * Two lines only when needed, with a near-even word break. Steel span
 * stays on the emphasis clause (original second segment, or second line).
 *
 * Measures on an off-DOM probe so binary search never paints intermediate
 * sizes. No font-size transitions - settle instantly to avoid jitter.
 */
(function () {
  var SEL = "h2.dm-section-title";
  var MIN = 18;
  var raf = 0;
  var resizeTimer = 0;
  var lastW = 0;
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

  function injectStaticStyle() {
    if (document.getElementById("dm-section-title-fit-style")) return;
    var st = document.createElement("style");
    st.id = "dm-section-title-fit-style";
    st.textContent =
      "h2.dm-section-title{" +
      "transition:none !important;" +
      "animation:none !important;}";
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
      if (preferredSteel && right === preferredSteel) score -= 12;
      if (!best || score < best.score) best = { left: left, right: right, score: score, ratio: ratio };
    }
    return best;
  }

  function makeProbe(el, width) {
    var probe = el.cloneNode(true);
    probe.removeAttribute("id");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:absolute !important;" +
      "left:-10000px !important;" +
      "top:0 !important;" +
      "visibility:hidden !important;" +
      "pointer-events:none !important;" +
      "display:block !important;" +
      "margin:0 !important;" +
      "transform:none !important;" +
      "transition:none !important;" +
      "animation:none !important;" +
      "white-space:nowrap !important;" +
      "width:" + width + "px !important;" +
      "max-width:" + width + "px !important;" +
      "box-sizing:border-box !important;";
    document.body.appendChild(probe);
    return probe;
  }

  function measureFits(el, width, size, probe) {
    var owned = !probe;
    if (!probe) probe = makeProbe(el, width);
    probe.style.setProperty("font-size", size + "px", "important");
    var ok = probe.scrollWidth <= width + 0.5;
    if (owned && probe.parentNode) probe.parentNode.removeChild(probe);
    return ok;
  }

  function bestSize(el, width, hi) {
    var probe = makeProbe(el, width);
    if (measureFits(el, width, hi, probe)) {
      if (probe.parentNode) probe.parentNode.removeChild(probe);
      return hi;
    }
    var lo = MIN;
    var best = MIN;
    var top = hi;
    for (var i = 0; i < 28; i++) {
      var mid = (lo + top) / 2;
      if (measureFits(el, width, mid, probe)) {
        best = mid;
        lo = mid;
      } else {
        top = mid;
      }
    }
    if (probe.parentNode) probe.parentNode.removeChild(probe);
    return best;
  }

  function isNarrow() {
    return (window.innerWidth || 1024) <= 760;
  }

  function layoutTitle(el, width, hi) {
    var parts = parseTitle(el);
    if (isNarrow()) {
      renderOne(el, parts);
      el.style.removeProperty("font-size");
      el.style.removeProperty("width");
      el.style.removeProperty("max-width");
      el.classList.add("dm-section-title--fluid");
      el.classList.remove("dm-section-title--one", "dm-section-title--two");
      return null;
    }
    el.classList.remove("dm-section-title--fluid");
    renderOne(el, parts);
    if (measureFits(el, width, Math.max(MIN, hi * 0.92))) {
      return bestSize(el, width, hi);
    }
    var br = balancedBreak(parts.full, parts.steel);
    if (br) {
      renderTwo(el, br.left, br.right);
      return bestSize(el, width, hi);
    }
    if (parts.steel && parts.ink) {
      renderTwo(el, parts.ink, parts.steel);
      return bestSize(el, width, hi);
    }
    renderOne(el, parts);
    return bestSize(el, width, hi);
  }

  function applySize(el, target) {
    var prev = parseFloat(el.style.fontSize) || 0;
    var next = parseFloat(target) || 0;
    if (prev && Math.abs(prev - next) < 1.0) return;
    el.style.setProperty("font-size", target, "important");
  }

  function fitAll() {
    raf = 0;
    var nodes = document.querySelectorAll(SEL);
    if (!nodes.length) return;

    var width = sharedWidth(nodes);
    var hi = maxForViewport();
    var sizes = [];
    var shared = hi;
    var anySized = false;

    for (var i = 0; i < nodes.length; i++) {
      var size = layoutTitle(nodes[i], width, hi);
      sizes.push(size);
      if (size != null) {
        anySized = true;
        if (size < shared) shared = size;
      }
    }

    if (!anySized) return;
    var target = shared.toFixed(2) + "px";
    for (var j = 0; j < nodes.length; j++) {
      if (sizes[j] == null) continue;
      applySize(nodes[j], target);
    }
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fitAll);
  }

  function scheduleResize() {
    var w = window.innerWidth || 0;
    if (Math.abs(w - lastW) < 2) return;
    lastW = w;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(schedule, 90);
  }

  function boot() {
    injectStaticStyle();
    lastW = window.innerWidth || 0;
    fitAll();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
    setTimeout(schedule, 200);
  }

  window.addEventListener("resize", scheduleResize, { passive: true });
  window.addEventListener("orientationchange", function () {
    lastW = 0;
    setTimeout(schedule, 100);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", schedule);
})();
