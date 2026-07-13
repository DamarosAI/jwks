/**
 * Make mailto CTAs do something on every platform.
 * - Mobile / Mac: open the native mail app via mailto
 * - Windows / Linux / no handler: fall back to Gmail compose (Outlook Web if Gmail blocked)
 * Prefills subject + body when the href omits them.
 */
(function () {
  var DEFAULTS = {
    "team@damaros.ai": {
      subject: "Damaros Pilot Inquiry",
      body: "Hi Damaros team,\n\nI'd like to start a pilot at our site.\n\nName:\nOrganization:\nRole:\n\nThanks,"
    },
    "anirudh@damaros.ai": {
      subject: "Damaros Pilot Inquiry",
      body: "Hi Anirudh,\n\n"
    }
  };

  function parseMailto(href) {
    var raw = String(href || "").replace(/^mailto:/i, "");
    var q = raw.indexOf("?");
    var to = (q >= 0 ? raw.slice(0, q) : raw).trim();
    try { to = decodeURIComponent(to); } catch (_) {}
    var params = new URLSearchParams(q >= 0 ? raw.slice(q + 1) : "");
    var defaults = DEFAULTS[to.toLowerCase()] || DEFAULTS["team@damaros.ai"];
    return {
      to: to,
      subject: params.get("subject") || defaults.subject,
      body: params.get("body") || defaults.body
    };
  }

  function mailtoUrl(p) {
    return "mailto:" + p.to
      + "?subject=" + encodeURIComponent(p.subject)
      + "&body=" + encodeURIComponent(p.body);
  }

  function gmailUrl(p) {
    return "https://mail.google.com/mail/?view=cm&fs=1&tf=1"
      + "&to=" + encodeURIComponent(p.to)
      + "&su=" + encodeURIComponent(p.subject)
      + "&body=" + encodeURIComponent(p.body);
  }

  function outlookUrl(p) {
    return "https://outlook.live.com/mail/0/deeplink/compose"
      + "?to=" + encodeURIComponent(p.to)
      + "&subject=" + encodeURIComponent(p.subject)
      + "&body=" + encodeURIComponent(p.body);
  }

  function isMobileLike() {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "")) return true;
    try {
      return window.matchMedia("(pointer: coarse)").matches
        && window.matchMedia("(max-width: 900px)").matches;
    } catch (_) {
      return false;
    }
  }

  function openWebmail(p) {
    var win = window.open(gmailUrl(p), "_blank", "noopener,noreferrer");
    if (!win) window.open(outlookUrl(p), "_blank", "noopener,noreferrer");
  }

  function openMail(href) {
    var p = parseMailto(href);
    var mail = mailtoUrl(p);

    if (isMobileLike()) {
      window.location.href = mail;
      return;
    }

    // Desktop: try the OS mail app first. If the window never blurs
    // (no handler — common on Windows Chrome), open webmail compose.
    var handedOff = false;
    function markHandedOff() { handedOff = true; }
    window.addEventListener("blur", markHandedOff, { once: true });
    document.addEventListener("visibilitychange", function onVis() {
      if (document.visibilityState === "hidden") {
        handedOff = true;
        document.removeEventListener("visibilitychange", onVis);
      }
    });

    window.location.href = mail;

    setTimeout(function () {
      window.removeEventListener("blur", markHandedOff);
      if (!handedOff && document.visibilityState === "visible") {
        openWebmail(p);
      }
    }, 700);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    e.preventDefault();
    openMail(a.getAttribute("href"));
  }, true);

  window.dmOpenMail = openMail;
})();
