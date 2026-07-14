/**
 * Damaros contact CTAs → copy-to-clipboard with an animated confirmation toast.
 * No mail APIs, no mail-app handoff: clicking any mailto link copies the
 * address (matching the "Email" copy button on the about page) and pops a
 * branded toast so the visitor knows exactly what happened.
 */
(function () {
  var STYLE_ID = "dm-copy-toast-style";
  var TOAST_ID = "dm-copy-toast";
  var TOAST_MS = 2800;

  function parseMailtoAddress(href) {
    var raw = String(href || "").replace(/^mailto:/i, "");
    var q = raw.indexOf("?");
    var to = (q >= 0 ? raw.slice(0, q) : raw).trim();
    try { to = decodeURIComponent(to); } catch (_) {}
    return to;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      // Full-viewport wrapper handles placement on every viewport; it never
      // blocks the page (pointer-events:none), only the pill is clickable.
      "#" + TOAST_ID + "-wrap{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:24px max(16px,env(safe-area-inset-right,0px)) max(28px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));box-sizing:border-box;pointer-events:none;}",
      "#" + TOAST_ID + "{display:flex;align-items:center;gap:12px;max-width:min(92vw,440px);padding:11px 22px 11px 13px;border-radius:999px;box-sizing:border-box;cursor:pointer;pointer-events:auto;color:#fff;background:linear-gradient(180deg,#3f8f6d,#2e9e6b);border:1px solid color-mix(in srgb,#2e9e6b 55%,rgba(255,255,255,0.25));box-shadow:inset 0 1px 0 rgba(255,255,255,0.22),0 14px 34px rgba(24,84,56,0.32);font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);animation:dm-toast-in 380ms cubic-bezier(0.22,1,0.36,1);}",
      "#" + TOAST_ID + ".dm-toast-out{animation:dm-toast-out 240ms ease forwards;}",
      "@keyframes dm-toast-in{from{opacity:0;transform:translateY(16px) scale(0.97);}to{opacity:1;transform:none;}}",
      "@keyframes dm-toast-out{from{opacity:1;transform:none;}to{opacity:0;transform:translateY(10px) scale(0.98);}}",
      "#" + TOAST_ID + " .dm-toast-badge{flex:none;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.16);box-shadow:inset 0 1px 0 rgba(255,255,255,0.25);}",
      "#" + TOAST_ID + " .dm-toast-check{width:17px;height:17px;stroke:#fff;stroke-width:2.6;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:26;stroke-dashoffset:26;animation:dm-check-draw 340ms cubic-bezier(0.65,0,0.35,1) 180ms forwards;}",
      "@keyframes dm-check-draw{to{stroke-dashoffset:0;}}",
      "#" + TOAST_ID + " .dm-toast-text{display:flex;flex-direction:column;gap:2px;min-width:0;}",
      "#" + TOAST_ID + " .dm-toast-eyebrow{font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:9.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.82);}",
      "#" + TOAST_ID + " .dm-toast-email{font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:14.5px;font-weight:700;letter-spacing:-0.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      // Mark eases in with a soft rise — no rotation.
      "#" + TOAST_ID + " .dm-toast-mark{flex:none;width:22px;height:25px;color:rgba(255,255,255,0.92);margin-left:2px;opacity:0;animation:dm-mark-in 460ms cubic-bezier(0.22,1,0.36,1) 220ms forwards;}",
      "@keyframes dm-mark-in{from{opacity:0;transform:translateY(5px) scale(0.9);}to{opacity:1;transform:none;}}",
      // Small / touch viewports: center the toast mid-screen so it is
      // unmissable and clear of thumbs, browser chrome, and keyboards.
      "@media (max-width:640px){#" + TOAST_ID + "-wrap{align-items:center;padding-bottom:24px;}#" + TOAST_ID + "{max-width:min(94vw,400px);}}",
      "@media (prefers-reduced-motion:reduce){#" + TOAST_ID + "{animation:none;}#" + TOAST_ID + ".dm-toast-out{animation:none;opacity:0;}#" + TOAST_ID + " .dm-toast-check{animation:none;stroke-dashoffset:0;}#" + TOAST_ID + " .dm-toast-mark{animation:none;opacity:1;}}"
    ].join("");
    document.head.appendChild(style);
  }

  var MARK_SVG = '<svg class="dm-toast-mark" viewBox="0 0 476 520" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"></path><path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"></path></svg>';

  var toastTimer = null;

  function removeToast(immediate) {
    var wrap = document.getElementById(TOAST_ID + "-wrap");
    if (!wrap) return;
    clearTimeout(toastTimer);
    if (immediate) {
      wrap.remove();
      return;
    }
    var toast = document.getElementById(TOAST_ID);
    if (toast) toast.classList.add("dm-toast-out");
    setTimeout(function () { wrap.remove(); }, 260);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(email, copied) {
    ensureStyles();
    removeToast(true);
    var wrap = document.createElement("div");
    wrap.id = TOAST_ID + "-wrap";
    var toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = [
      '<span class="dm-toast-badge"><svg class="dm-toast-check" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg></span>',
      '<span class="dm-toast-text">',
      '  <span class="dm-toast-eyebrow">' + (copied ? "Email copied" : "Email us at") + "</span>",
      '  <span class="dm-toast-email">' + escapeHtml(email) + "</span>",
      "</span>",
      MARK_SVG
    ].join("");
    toast.addEventListener("click", function () { removeToast(false); });
    wrap.appendChild(toast);
    document.body.appendChild(wrap);
    toastTimer = setTimeout(function () { removeToast(false); }, TOAST_MS);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
    return ok;
  }

  function copyThenToast(email) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(
        function () { showToast(email, true); },
        function () { showToast(email, fallbackCopy(email)); }
      );
    } else {
      showToast(email, fallbackCopy(email));
    }
  }

  // Every mailto CTA becomes a copy action with the confirmation toast.
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    e.preventDefault();
    copyThenToast(parseMailtoAddress(a.getAttribute("href")) || "team@damaros.ai");
  }, true);

  // In-place "Email" copy buttons (about page) keep their own morph animation.
  function copyEmailButton(btn) {
    var email = btn.getAttribute("data-copy-email") || "";
    if (!email) return;
    var label = btn.querySelector(".dm-copy-email-label") || btn;
    var original = label.textContent;
    var done = function () {
      btn.classList.add("dm-copied");
      label.textContent = "Copied";
      btn.setAttribute("aria-label", "Copied " + email);
      clearTimeout(btn.__dmCopyT);
      btn.__dmCopyT = setTimeout(function () {
        btn.classList.remove("dm-copied");
        label.textContent = original;
        btn.setAttribute("aria-label", "Copy " + email);
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done).catch(function () {
        fallbackCopy(email);
        done();
      });
    } else {
      fallbackCopy(email);
      done();
    }
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    var btn = e.target && e.target.closest && e.target.closest("[data-copy-email]");
    if (!btn) return;
    e.preventDefault();
    copyEmailButton(btn);
  }, true);

  // Kept for any external callers of the old form API.
  window.dmOpenMail = function (href) {
    copyThenToast(parseMailtoAddress(href) || "team@damaros.ai");
  };
})();
