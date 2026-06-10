/* Damaros — dark mode only for now; clear legacy light pins. */
(function () {
  var root = document.documentElement;
  try { localStorage.removeItem("damaros-theme"); } catch (e) {}
  root.setAttribute("data-theme", "dark");
})();
