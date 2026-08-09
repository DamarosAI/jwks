/**
 * Mobile float-nav: brand stays visible; tab strip becomes a dropdown panel.
 * Uses document-level delegation so DC/React remounts keep working.
 */
(function () {
  var MQ = "(max-width: 720px)";

  function navFrom(el) {
    return el && el.closest ? el.closest(".dm-float-nav") : null;
  }

  function menuBtn(nav) {
    return nav ? nav.querySelector(".dm-float-nav__menu") : null;
  }

  function ensureBackdrop(nav) {
    var backdrop = nav.querySelector(".dm-float-nav__backdrop");
    if (backdrop) return backdrop;
    backdrop = document.createElement("div");
    backdrop.className = "dm-float-nav__backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    nav.insertBefore(backdrop, nav.firstChild);
    return backdrop;
  }

  function closeNav(nav) {
    if (!nav) return;
    nav.classList.remove("is-open");
    var btn = menuBtn(nav);
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (!document.querySelector(".dm-float-nav.is-open")) {
      document.documentElement.classList.remove("dm-nav-lock");
    }
  }

  function openNav(nav) {
    // Only one open nav at a time.
    document.querySelectorAll(".dm-float-nav.is-open").forEach(closeNav);
    ensureBackdrop(nav);
    nav.classList.add("is-open");
    var btn = menuBtn(nav);
    if (btn) btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("dm-nav-lock");
  }

  function toggleNav(nav) {
    if (!nav) return;
    if (nav.classList.contains("is-open")) closeNav(nav);
    else openNav(nav);
  }

  function injectLockStyle() {
    if (document.getElementById("dm-float-nav-lock-style")) return;
    var st = document.createElement("style");
    st.id = "dm-float-nav-lock-style";
    st.textContent =
      "html.dm-nav-lock,html.dm-nav-lock body{overflow:hidden !important;}";
    (document.head || document.documentElement).appendChild(st);
  }

  function isMobileNav() {
    try {
      return window.matchMedia(MQ).matches;
    } catch (err) {
      return window.innerWidth <= 720;
    }
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var backdrop = t.closest(".dm-float-nav__backdrop");
    if (backdrop) {
      closeNav(navFrom(backdrop));
      return;
    }

    var btn = t.closest(".dm-float-nav__menu");
    if (btn) {
      e.preventDefault();
      toggleNav(navFrom(btn));
      return;
    }

    var link = t.closest(".dm-float-nav__tabs a");
    if (link) {
      closeNav(navFrom(link));
      return;
    }

    // Outside click closes an open mobile menu.
    var open = document.querySelector(".dm-float-nav.is-open");
    if (open && !t.closest(".dm-float-nav")) closeNav(open);
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".dm-float-nav.is-open").forEach(closeNav);
    }
  }

  function onViewportChange() {
    if (!isMobileNav()) {
      document.querySelectorAll(".dm-float-nav.is-open").forEach(closeNav);
    }
  }

  function init() {
    injectLockStyle();
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeydown);

    var mq = null;
    try {
      mq = window.matchMedia(MQ);
    } catch (err) {}
    if (mq) {
      if (mq.addEventListener) mq.addEventListener("change", onViewportChange);
      else if (mq.addListener) mq.addListener(onViewportChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
