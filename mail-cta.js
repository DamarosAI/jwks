/**
 * Damaros contact CTAs:
 *  - "Start a pilot" (data-pilot-form / Pilot Inquiry mailto) → modal form → POST /api/pilot-inquiry
 *  - Other mailto links → copy address + toast
 *  - [data-copy-email] buttons → in-place copy morph
 */
(function () {
  var STYLE_ID = "dm-copy-toast-style";
  var TOAST_ID = "dm-copy-toast";
  var TOAST_MS = 2800;
  var DIALOG_STYLE_ID = "dm-pilot-dialog-style";
  var DIALOG_ID = "dm-pilot-dialog";

  function parseMailtoAddress(href) {
    var raw = String(href || "").replace(/^mailto:/i, "");
    var q = raw.indexOf("?");
    var to = (q >= 0 ? raw.slice(0, q) : raw).trim();
    try { to = decodeURIComponent(to); } catch (_) {}
    return to;
  }

  function isPilotCta(a) {
    if (!a) return false;
    if (a.hasAttribute("data-pilot-form")) return true;
    var href = a.getAttribute("href") || "";
    return /Pilot(%20|\+| )?Inquiry/i.test(href) || /subject=Damaros%20Pilot%20Inquiry/i.test(href);
  }

  function ensureToastStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
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
      "#" + TOAST_ID + " .dm-toast-mark{flex:none;width:22px;height:25px;color:rgba(255,255,255,0.92);margin-left:2px;opacity:0;animation:dm-mark-in 460ms cubic-bezier(0.22,1,0.36,1) 220ms forwards;}",
      "@keyframes dm-mark-in{from{opacity:0;transform:translateY(5px) scale(0.9);}to{opacity:1;transform:none;}}",
      "@media (max-width:640px){#" + TOAST_ID + "-wrap{align-items:center;padding-bottom:24px;}#" + TOAST_ID + "{max-width:min(94vw,400px);}}",
      "@media (prefers-reduced-motion:reduce){#" + TOAST_ID + "{animation:none;}#" + TOAST_ID + ".dm-toast-out{animation:none;opacity:0;}#" + TOAST_ID + " .dm-toast-check{animation:none;stroke-dashoffset:0;}#" + TOAST_ID + " .dm-toast-mark{animation:none;opacity:1;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureDialogStyles() {
    if (document.getElementById(DIALOG_STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = DIALOG_STYLE_ID;
    style.textContent = [
      "#" + DIALOG_ID + "-root{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));box-sizing:border-box;}",
      "#" + DIALOG_ID + "-root[hidden]{display:none !important;}",
      "#" + DIALOG_ID + "-backdrop{position:absolute;inset:0;background:rgba(16,22,29,0.48);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:dm-pilot-fade 220ms ease;}",
      "#" + DIALOG_ID + "{position:relative;width:min(100%,440px);max-height:min(92dvh,720px);overflow:auto;background:#f7fafc;border:1px solid rgba(47,97,147,0.18);border-radius:18px;box-shadow:0 24px 64px rgba(16,22,29,0.22),inset 0 1px 0 rgba(255,255,255,0.7);padding:26px 26px 22px;box-sizing:border-box;animation:dm-pilot-in 280ms cubic-bezier(0.22,1,0.36,1);}",
      "@keyframes dm-pilot-fade{from{opacity:0;}to{opacity:1;}}",
      "@keyframes dm-pilot-in{from{opacity:0;transform:translateY(12px) scale(0.98);}to{opacity:1;transform:none;}}",
      "#" + DIALOG_ID + " .dm-pilot-eyebrow{margin:0 0 6px;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-steel,#2f6193);}",
      "#" + DIALOG_ID + " .dm-pilot-title{margin:0 0 6px;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:22px;font-weight:700;letter-spacing:-0.02em;color:var(--ink-cold,#10161d);}",
      "#" + DIALOG_ID + " .dm-pilot-lead{margin:0 0 20px;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);font-size:14px;line-height:1.5;color:var(--ink-quiet,#3c4955);}",
      "#" + DIALOG_ID + " .dm-pilot-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:none;border-radius:999px;background:rgba(31,45,61,0.06);color:var(--ink-quiet,#3c4955);cursor:pointer;display:grid;place-items:center;}",
      "#" + DIALOG_ID + " .dm-pilot-close:hover{background:rgba(31,45,61,0.1);}",
      "#" + DIALOG_ID + " .dm-pilot-grid{display:grid;gap:12px;}",
      "#" + DIALOG_ID + " label{display:flex;flex-direction:column;gap:5px;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-dim,#7b8794);}",
      "#" + DIALOG_ID + " input,#" + DIALOG_ID + " textarea{width:100%;box-sizing:border-box;margin:0;padding:11px 12px;border-radius:10px;border:1px solid rgba(31,45,61,0.14);background:#fff;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);font-size:14.5px;font-weight:500;letter-spacing:0;text-transform:none;color:var(--ink-cold,#10161d);outline:none;}",
      "#" + DIALOG_ID + " input:focus,#" + DIALOG_ID + " textarea:focus{border-color:color-mix(in srgb,#2f6193 55%,transparent);box-shadow:0 0 0 3px rgba(47,97,147,0.14);}",
      "#" + DIALOG_ID + " textarea{min-height:88px;resize:vertical;}",
      "#" + DIALOG_ID + " .dm-pilot-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}",
      "#" + DIALOG_ID + " .dm-pilot-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:18px;}",
      "#" + DIALOG_ID + " .dm-pilot-submit{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 20px;border-radius:999px;border:1px solid color-mix(in srgb,#2f6193 50%,rgba(255,255,255,0.22));background:linear-gradient(180deg,#3d72a8,#2f6193);color:#fff;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 8px 20px rgba(20,46,82,0.16);}",
      "#" + DIALOG_ID + " .dm-pilot-submit:disabled{opacity:0.65;cursor:wait;}",
      "#" + DIALOG_ID + " .dm-pilot-cancel{appearance:none;border:none;background:transparent;padding:8px 10px;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);font-size:13.5px;font-weight:500;color:var(--ink-quiet,#3c4955);cursor:pointer;}",
      "#" + DIALOG_ID + " .dm-pilot-status{margin:12px 0 0;min-height:1.2em;font-size:13px;line-height:1.4;color:var(--ink-quiet,#3c4955);}",
      "#" + DIALOG_ID + " .dm-pilot-status[data-tone=error]{color:#b42318;}",
      "#" + DIALOG_ID + " .dm-pilot-status[data-tone=ok]{color:#1f7a52;}",
      "#" + DIALOG_ID + " .dm-pilot-success{display:none;text-align:center;padding:18px 8px 8px;}",
      "#" + DIALOG_ID + "[data-state=success] form{display:none;}",
      "#" + DIALOG_ID + "[data-state=success] .dm-pilot-success{display:block;}",
      "#" + DIALOG_ID + " .dm-pilot-success h3{margin:12px 0 6px;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:20px;letter-spacing:-0.02em;}",
      "#" + DIALOG_ID + " .dm-pilot-success p{margin:0;font-size:14px;line-height:1.5;color:var(--ink-quiet,#3c4955);}",
      "@media (prefers-reduced-motion:reduce){#" + DIALOG_ID + "-backdrop,#" + DIALOG_ID + "{animation:none;}}"
    ].join("");
    document.head.appendChild(style);
  }

  var MARK_SVG = '<svg class="dm-toast-mark" viewBox="0 0 476 520" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"></path><path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"></path></svg>';

  var toastTimer = null;
  var lastFocus = null;
  var dialogRoot = null;

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
    ensureToastStyles();
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

  function ensureDialog() {
    if (dialogRoot) return dialogRoot;
    ensureDialogStyles();
    dialogRoot = document.createElement("div");
    dialogRoot.id = DIALOG_ID + "-root";
    dialogRoot.hidden = true;
    dialogRoot.innerHTML = [
      '<div id="' + DIALOG_ID + '-backdrop" data-pilot-dismiss></div>',
      '<div id="' + DIALOG_ID + '" role="dialog" aria-modal="true" aria-labelledby="dm-pilot-title" data-state="form">',
      '  <button type="button" class="dm-pilot-close" aria-label="Close" data-pilot-dismiss>',
      '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      "  </button>",
      '  <p class="dm-pilot-eyebrow">Pilot inquiry</p>',
      '  <h2 class="dm-pilot-title" id="dm-pilot-title">Start a pilot</h2>',
      '  <p class="dm-pilot-lead">Tell us who you are. We route this to team@damaros.ai and reply from there.</p>',
      '  <form id="dm-pilot-form" novalidate>',
      '    <div class="dm-pilot-grid">',
      '      <label>Name<input name="name" type="text" autocomplete="name" required maxlength="120" placeholder="Jane Smith"></label>',
      '      <label>Role<input name="role" type="text" autocomplete="organization-title" required maxlength="120" placeholder="VP Clinical Ops"></label>',
      '      <label>Organization<input name="organization" type="text" autocomplete="organization" required maxlength="160" placeholder="Meridian Oncology"></label>',
      '      <label>Work email<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="jane@company.com"></label>',
      '      <label>Message <span style="font-weight:500;text-transform:none;letter-spacing:0;color:var(--ink-dim,#7b8794);">(optional)</span><textarea name="message" maxlength="4000" placeholder="What are you trying to run?"></textarea></label>',
      '      <label class="dm-pilot-hp" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label>',
      "    </div>",
      '    <div class="dm-pilot-actions">',
      '      <button type="submit" class="dm-pilot-submit">Send inquiry</button>',
      '      <button type="button" class="dm-pilot-cancel" data-pilot-dismiss>Cancel</button>',
      "    </div>",
      '    <p class="dm-pilot-status" role="status" aria-live="polite"></p>',
      "  </form>",
      '  <div class="dm-pilot-success">',
      '    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e9e6b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><polyline points="8.5 12.5 11 15 16 9.5"></polyline></svg>',
      "    <h3>Inquiry sent</h3>",
      "    <p>Thanks — we will follow up at the email you provided.</p>",
      '    <div class="dm-pilot-actions" style="justify-content:center;margin-top:20px;">',
      '      <button type="button" class="dm-pilot-submit" data-pilot-dismiss>Done</button>',
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");
    document.body.appendChild(dialogRoot);

    dialogRoot.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest("[data-pilot-dismiss]")) {
        closePilotDialog();
      }
    });

    var form = dialogRoot.querySelector("#dm-pilot-form");
    form.addEventListener("submit", onPilotSubmit);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dialogRoot && !dialogRoot.hidden) {
        e.preventDefault();
        closePilotDialog();
      }
    });

    return dialogRoot;
  }

  function setStatus(text, tone) {
    var el = dialogRoot && dialogRoot.querySelector(".dm-pilot-status");
    if (!el) return;
    el.textContent = text || "";
    if (tone) el.setAttribute("data-tone", tone);
    else el.removeAttribute("data-tone");
  }

  function openPilotDialog() {
    var root = ensureDialog();
    lastFocus = document.activeElement;
    var dialog = root.querySelector("#" + DIALOG_ID);
    var form = root.querySelector("#dm-pilot-form");
    dialog.setAttribute("data-state", "form");
    form.reset();
    setStatus("", null);
    root.hidden = false;
    document.documentElement.style.overflow = "hidden";
    var first = form.querySelector('input[name="name"]');
    if (first) first.focus();
  }

  function closePilotDialog() {
    if (!dialogRoot || dialogRoot.hidden) return;
    dialogRoot.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      try { lastFocus.focus(); } catch (_) {}
    }
  }

  function onPilotSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var submit = form.querySelector(".dm-pilot-submit");
    var fd = new FormData(form);
    var payload = {
      name: String(fd.get("name") || ""),
      role: String(fd.get("role") || ""),
      organization: String(fd.get("organization") || ""),
      email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || "")
    };

    if (!payload.name.trim() || !payload.role.trim() || !payload.organization.trim() || !payload.email.trim()) {
      setStatus("Please fill in name, role, organization, and work email.", "error");
      return;
    }

    submit.disabled = true;
    setStatus("Sending…", null);

    fetch("/api/pilot-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { res: res, body: body };
        });
      })
      .then(function (_ref) {
        var res = _ref.res;
        var body = _ref.body;
        if (!res.ok) {
          setStatus((body && body.error) || "Could not send. Try again.", "error");
          return;
        }
        var dialog = dialogRoot.querySelector("#" + DIALOG_ID);
        dialog.setAttribute("data-state", "success");
        setStatus("", null);
      })
      .catch(function () {
        setStatus("Network error. Check your connection and try again.", "error");
      })
      .then(function () {
        submit.disabled = false;
      });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest('a[href^="mailto:"], a[data-pilot-form]');
    if (!a) return;
    if (isPilotCta(a)) {
      e.preventDefault();
      openPilotDialog();
      return;
    }
    if ((a.getAttribute("href") || "").indexOf("mailto:") === 0) {
      e.preventDefault();
      copyThenToast(parseMailtoAddress(a.getAttribute("href")) || "team@damaros.ai");
    }
  }, true);

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

  window.dmOpenMail = function (href) {
    if (isPilotCta({ getAttribute: function () { return href; }, hasAttribute: function () { return false; } })) {
      openPilotDialog();
      return;
    }
    copyThenToast(parseMailtoAddress(href) || "team@damaros.ai");
  };

  window.dmOpenPilotForm = openPilotDialog;
})();
