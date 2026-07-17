/**
 * Endless logo marquee: clone the first logo set until the track is at least
 * 2x the viewport width, then shift by exactly one set width so the loop
 * never shows empty cards.
 */
(function () {
  function fill() {
    var wall = document.querySelector(".dm-site .dm-logowall");
    var track = document.querySelector(".dm-site .dm-logo-track");
    if (!wall || !track) return;

    var source = track.querySelector(".dm-logo-set");
    if (!source) return;

    track.querySelectorAll(".dm-logo-set.dm-logo-clone").forEach(function (el) {
      el.remove();
    });

    // Hide broken images so empty white tiles never appear in the loop.
    track.querySelectorAll(".dm-logo-tile img").forEach(function (img) {
      if (img.dataset.dmBound) return;
      img.dataset.dmBound = "1";
      img.addEventListener("error", function () {
        img.classList.add("dm-logo-broken");
        var tile = img.closest(".dm-logo-tile");
        if (tile) tile.style.display = "none";
        fill();
      });
    });

    var display = window.getComputedStyle(track).display;
    if (display === "contents") {
      track.style.removeProperty("--dm-logo-shift");
      return;
    }

    var minWidth = Math.max(wall.clientWidth * 2, 1);
    var guard = 0;
    while (track.scrollWidth < minWidth && guard < 10) {
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

  var scheduled = 0;
  function schedule() {
    if (scheduled) return;
    scheduled = window.requestAnimationFrame(function () {
      scheduled = 0;
      fill();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
})();
