/**
 * Contact CTAs open a Gmail / Outlook picker (no native mailto).
 * Prefills subject + body from defaults when the href omits them.
 */
(function () {
  var DEFAULTS = {
    "team@damaros.ai": {
      subject: "Damaros Pilot Inquiry",
      body: "Hi Damaros Team,\n\nI'm interested in learning more about the platform and exploring a pilot.\n\nRole/Title:\nOrganization:\n"
    },
    "anirudh@damaros.ai": {
      subject: "Damaros Founder Inquiry",
      body: "Hi Anirudh,\n\nI wanted to get connected regarding Damaros.\n"
    }
  };

  var STYLE_ID = "dm-mail-picker-style";
  var ROOT_ID = "dm-mail-picker";

  function parseMailto(href) {
    var raw = String(href || "").replace(/^mailto:/i, "");
    var q = raw.indexOf("?");
    var to = (q >= 0 ? raw.slice(0, q) : raw).trim();
    try { to = decodeURIComponent(to); } catch (_) {}
    var params = new URLSearchParams(q >= 0 ? raw.slice(q + 1) : "");
    var defaults = DEFAULTS[to.toLowerCase()] || {
      subject: params.get("subject") || "Damaros inquiry",
      body: ""
    };
    return {
      to: to,
      subject: params.get("subject") || defaults.subject,
      body: params.get("body") || defaults.body
    };
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

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + ROOT_ID + "{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,22,29,0.42);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}",
      "#" + ROOT_ID + " .dm-mail-card{width:min(380px,100%);border-radius:16px;background:linear-gradient(180deg,#ffffff,#f6f9fc);border:1px solid rgba(31,45,61,0.12);box-shadow:0 24px 60px rgba(20,40,70,0.22);padding:22px 22px 18px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}",
      "#" + ROOT_ID + " .dm-mail-title{margin:0;font-size:16px;font-weight:700;letter-spacing:-0.02em;color:#10161d;}",
      "#" + ROOT_ID + " .dm-mail-sub{margin:6px 0 16px;font-size:13px;line-height:1.45;color:#586674;}",
      "#" + ROOT_ID + " .dm-mail-actions{display:flex;flex-direction:column;gap:8px;}",
      "#" + ROOT_ID + " .dm-mail-btn{display:flex;align-items:center;justify-content:center;height:44px;border-radius:999px;border:1px solid transparent;font-size:13px;font-weight:600;letter-spacing:0.02em;cursor:pointer;text-decoration:none;}",
      "#" + ROOT_ID + " .dm-mail-btn-gmail{color:#fff;background:linear-gradient(180deg,#3d72a8,#2f6193);border-color:color-mix(in srgb,#2f6193 50%,rgba(255,255,255,0.22));box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 8px 20px rgba(20,46,82,0.16);}",
      "#" + ROOT_ID + " .dm-mail-btn-outlook{color:#10161d;background:#fff;border-color:rgba(31,45,61,0.16);}",
      "#" + ROOT_ID + " .dm-mail-cancel{margin-top:10px;display:block;width:100%;background:none;border:none;cursor:pointer;font-size:12px;color:#7b8794;padding:8px;}"
    ].join("");
    document.head.appendChild(style);
  }

  function closePicker() {
    var root = document.getElementById(ROOT_ID);
    if (root) root.remove();
    document.removeEventListener("keydown", onKeyDown, true);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") closePicker();
  }

  function openPicker(p) {
    closePicker();
    ensureStyles();

    var root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Choose email app");

    root.innerHTML = [
      '<div class="dm-mail-card">',
      '  <p class="dm-mail-title">Open email with</p>',
      '  <p class="dm-mail-sub">Compose a message to ' + escapeHtml(p.to) + '</p>',
      '  <div class="dm-mail-actions">',
      '    <a class="dm-mail-btn dm-mail-btn-gmail" data-provider="gmail" href="' + escapeAttr(gmailUrl(p)) + '" target="_blank" rel="noopener noreferrer">Gmail</a>',
      '    <a class="dm-mail-btn dm-mail-btn-outlook" data-provider="outlook" href="' + escapeAttr(outlookUrl(p)) + '" target="_blank" rel="noopener noreferrer">Outlook</a>',
      "  </div>",
      '  <button type="button" class="dm-mail-cancel">Cancel</button>',
      "</div>"
    ].join("");

    root.addEventListener("click", function (e) {
      if (e.target === root || e.target.classList.contains("dm-mail-cancel")) {
        e.preventDefault();
        closePicker();
        return;
      }
      var link = e.target.closest && e.target.closest("a[data-provider]");
      if (link) closePicker();
    });

    document.body.appendChild(root);
    document.addEventListener("keydown", onKeyDown, true);
    var first = root.querySelector("a[data-provider]");
    if (first) first.focus();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function openMail(href) {
    openPicker(parseMailto(href));
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
