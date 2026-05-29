/* Damaros — shared theme toggle. Auto-detect + manual override, persisted. */
(function () {
  var KEY = "damaros-theme";
  function sysPref() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }
  // initial — run ASAP to avoid flash
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  document.documentElement.setAttribute("data-theme", saved || sysPref());

  window.DamarosTheme = {
    toggle: function () {
      var cur = document.documentElement.getAttribute("data-theme");
      apply(cur === "light" ? "dark" : "light");
    },
    mount: function (sel) {
      var btn = document.querySelector(sel || ".dmx-theme");
      if (btn) btn.addEventListener("click", window.DamarosTheme.toggle);
    }
  };
  document.addEventListener("DOMContentLoaded", function () { window.DamarosTheme.mount(); });
})();
