/**
 * Endless logo marquee: clone the first logo set until the track is wide
 * enough for a seamless loop, then shift by exactly one set width.
 * Runs on every viewport (desktop is always a ~4-across carousel).
 */
(function () {
  var scheduled = 0;

  function schedule() {
    if (scheduled) return;
    scheduled = window.requestAnimationFrame(function () {
      scheduled = 0;
      fill();
    });
  }

  function bindImg(img) {
    if (img.dataset.dmBound) return;
    img.dataset.dmBound = "1";
    if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
    if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    img.addEventListener("error", function () {
      img.classList.add("dm-logo-broken");
      var tile = img.closest(".dm-logo-tile");
      if (tile) tile.style.display = "none";
      schedule();
    });
    if (!img.complete) {
      img.addEventListener("load", schedule, { once: true });
    }
  }

  function fill() {
    var wall = document.querySelector(".dm-site .dm-logowall");
    var track = document.querySelector(".dm-site .dm-logo-track");
    if (!wall || !track) return;

    var source = track.querySelector(".dm-logo-set:not(.dm-logo-dupe)");
    if (!source) source = track.querySelector(".dm-logo-set");
    if (!source) return;

    track.querySelectorAll(".dm-logo-set.dm-logo-clone").forEach(function (el) {
      el.remove();
    });

    // Hide broken images so empty white tiles never appear in the loop.
    track.querySelectorAll(".dm-logo-tile img").forEach(bindImg);

    var display = window.getComputedStyle(track).display;
    if (display === "contents" || display === "none") {
      track.style.removeProperty("--dm-logo-shift");
      return;
    }

    // Force layout so tile clamp widths are settled before measuring.
    void wall.offsetWidth;
    void source.offsetWidth;

    // Keep enough clones that a 4-across desktop viewport never runs dry.
    var minWidth = Math.max(wall.clientWidth * 3, source.offsetWidth * 2, 1);
    var guard = 0;
    while (track.scrollWidth < minWidth && guard < 12) {
      var clone = source.cloneNode(true);
      clone.classList.add("dm-logo-dupe", "dm-logo-clone");
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("img[alt]").forEach(function (img) {
        img.setAttribute("alt", "");
      });
      track.appendChild(clone);
      guard += 1;
    }

    var shift = source.offsetWidth;
    if (shift > 0) track.style.setProperty("--dm-logo-shift", shift + "px");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);

  if (typeof ResizeObserver !== "undefined") {
    var roBoot = function () {
      var wall = document.querySelector(".dm-site .dm-logowall");
      if (!wall || wall.dataset.dmRo) return;
      wall.dataset.dmRo = "1";
      new ResizeObserver(schedule).observe(wall);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", roBoot);
    } else {
      roBoot();
    }
  }
})();
