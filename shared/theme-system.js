/* Damaros — clear legacy theme pins; OS scheme is handled in CSS. */
(function () {
  var root = document.documentElement;
  try { localStorage.removeItem("damaros-theme"); } catch (e) {}
  root.removeAttribute("data-theme");
})();
