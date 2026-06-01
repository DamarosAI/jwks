(function () {
  var el = document.getElementById("geo");
  if (!el) return;
  var ac = new AbortController();
  var to = setTimeout(function () { try { ac.abort(); } catch (e) {} }, 5000);
  fetch("https://get.geojs.io/v1/ip/geo.json", { credentials: "omit", signal: ac.signal })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (d) {
      clearTimeout(to);
      var nat = (d.country || "").trim();
      el.classList.remove("pending");
      el.textContent = nat || "United States";
    })
    .catch(function () {
      clearTimeout(to);
      el.classList.remove("pending");
      el.textContent = "United States";
    });
})();
