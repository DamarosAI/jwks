/**
 * Fit section headlines. Prefer one line when the full sentence fits.
 * Author <br> is a phrase break and is never rebalanced. Auto two-line
 * splits skip hanging prepositions/articles so a line cannot end on
 * "on" / "of" / "the". Steel span stays on the original emphasis clause.
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
  var HANG_START = {
    a: 1, an: 1, and: 1, as: 1, at: 1, but: 1, by: 1, for: 1, from: 1,
    in: 1, into: 1, nor: 1, of: 1, on: 1, or: 1, the: 1, to: 1, with: 1
  };
  var HANG_END = {
    a: 1, an: 1, and: 1, as: 1, at: 1, but: 1, by: 1, for: 1, from: 1,
    in: 1, into: 1, nor: 1, of: 1, on: 1, or: 1, the: 1, to: 1, with: 1,
    cannot: 1, can: 1, could: 1, may: 1, might: 1, must: 1, shall: 1,
    should: 1, will: 1, would: 1
  };

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

  function normalizeText(s) {
    return String(s || "").replace(/[^\S\u00A0]+/g, " ").replace(/ +/g, " ").trim();
  }

  function edgeWord(s, end) {
    var parts = normalizeText(s).split(" ").filter(Boolean);
    var raw = end ? parts[parts.length - 1] : parts[0];
    return String(raw || "").replace(/[^\w']/g, "").toLowerCase();
  }

  function isHangingBreak(left, right) {
    return !!(HANG_END[edgeWord(left, true)] || HANG_START[edgeWord(right, false)]);
  }

  function splitAtBr(el) {
    var br = el.querySelector("br");
    if (!br) return null;
    var before = [];
    var node = el.firstChild;
    while (node && node !== br) {
      before.push(node.textContent || "");
      node = node.nextSibling;
    }
    var after = [];
    node = br.nextSibling;
    while (node) {
      after.push(node.textContent || "");
      node = node.nextSibling;
    }
    var left = normalizeText(before.join(""));
    var right = normalizeText(after.join(""));
    if (!left || !right) return null;
    return { left: left, right: right };
  }

  function parseTitle(el) {
    if (el.__dmTitleParts) return el.__dmTitleParts;
    var steelEl = el.querySelector(".dm-section-title__steel");
    var steel = steelEl ? normalizeText(steelEl.textContent) : "";
    var explicit = splitAtBr(el);
    var clone = el.cloneNode(true);
    var cloneSteel = clone.querySelector(".dm-section-title__steel");
    if (cloneSteel) cloneSteel.replaceWith(document.createTextNode(cloneSteel.textContent));
    clone.querySelectorAll("br").forEach(function (br) {
      br.replaceWith(document.createTextNode(" "));
    });
    var full = normalizeText(clone.textContent);
    var ink = full;
    if (steel && full.slice(-steel.length) === steel) {
      ink = full.slice(0, full.length - steel.length).replace(/\s+$/, "");
    }
    el.__dmTitleParts = { ink: ink, steel: steel, full: full, explicit: explicit };
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

  function renderTwo(el, line1, line2, steelLine2) {
    el.classList.add("dm-section-title--two");
    el.classList.remove("dm-section-title--one");
    el.innerHTML = "";
    el.appendChild(document.createTextNode(line1));
    el.appendChild(document.createElement("br"));
    if (steelLine2) {
      var span = document.createElement("span");
      span.className = "dm-section-title__steel";
      span.textContent = line2;
      el.appendChild(span);
    } else {
      el.appendChild(document.createTextNode(line2));
    }
  }

  function steelSecond(parts, line2) {
    return !!(parts.steel && line2 === parts.steel);
  }

  function phraseBreak(parts, forceClass) {
    if (parts.explicit && parts.explicit.left && parts.explicit.right) return parts.explicit;
    if (forceClass && parts.ink && parts.steel) return { left: parts.ink, right: parts.steel };
    return null;
  }

  function balancedBreak(full, preferredSteel) {
    var words = full.split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;
    var best = null;
    var mid = full.length / 2;
    for (var i = 1; i < words.length; i++) {
      var left = words.slice(0, i).join(" ");
      var right = words.slice(i).join(" ");
      if (isHangingBreak(left, right)) continue;
      var ratio = Math.abs(left.length - right.length) / Math.max(left.length, right.length, 1);
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
    var forced = phraseBreak(parts, el.classList.contains("dm-section-title--break"));
    if (isNarrow()) {
      if (forced) {
        renderTwo(el, forced.left, forced.right, steelSecond(parts, forced.right));
        el.classList.add("dm-section-title--fluid");
        el.classList.remove("dm-section-title--one", "dm-section-title--two");
        el.style.removeProperty("font-size");
        el.style.removeProperty("width");
        el.style.removeProperty("max-width");
        return null;
      }
      renderOne(el, parts);
      return bestSize(el, width, hi);
    }
    el.classList.remove("dm-section-title--fluid");
    if (forced) {
      renderTwo(el, forced.left, forced.right, steelSecond(parts, forced.right));
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

    for (var i = 0; i < nodes.length; i++) {
      var size = layoutTitle(nodes[i], width, hi);
      sizes.push(size);
      if (size != null && !(nodes[i].closest && nodes[i].closest("#thesis"))) {
        if (size < shared) shared = size;
      }
    }

    for (var j = 0; j < nodes.length; j++) {
      if (sizes[j] == null) continue;
      var px = (nodes[j].closest && nodes[j].closest("#thesis")) ? sizes[j] : shared;
      if (px == null) continue;
      applySize(nodes[j], px.toFixed(2) + "px");
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
  }

  var api = {
    isHangingBreak: isHangingBreak,
    balancedBreak: balancedBreak
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
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
  }
})();
