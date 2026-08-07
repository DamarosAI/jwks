/**
 * Proof section Review / Pass record toggle.
 */
(function () {
  function wireProofTabs() {
    document.querySelectorAll(".dm-proof-tab").forEach(function (tab) {
      if (tab.getAttribute("data-wired") === "1") return;
      tab.setAttribute("data-wired", "1");
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-proof-tab");
        var section = tab.closest("#output") || document;
        section.querySelectorAll(".dm-proof-tab").forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        section.querySelectorAll(".dm-proof-panel").forEach(function (p) {
          var show = p.getAttribute("data-proof-panel") === key;
          p.classList.toggle("is-active", show);
          if (show) p.removeAttribute("hidden");
          else p.setAttribute("hidden", "");
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireProofTabs);
  } else {
    wireProofTabs();
  }
  window.addEventListener("load", wireProofTabs);
})();
