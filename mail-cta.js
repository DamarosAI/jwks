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
      "#" + DIALOG_ID + "-root{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-sizing:border-box;}",
      "#" + DIALOG_ID + "-root[hidden]{display:none !important;}",
      "#" + DIALOG_ID + "-root[data-closing]{pointer-events:none;}",
      "#" + DIALOG_ID + "-backdrop{position:absolute;inset:0;background:rgba(16,22,29,0.42);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:dm-pilot-fade 220ms ease;}",
      "#" + DIALOG_ID + "{position:relative;display:flex;flex-direction:column;width:min(100%,460px);max-height:min(92dvh,720px);overflow:hidden;text-align:left;background:#fff;border:1px solid rgba(31,45,61,0.12);border-radius:14px;box-shadow:0 24px 64px rgba(16,22,29,0.2),inset 0 1px 0 rgba(255,255,255,0.9);padding:22px 22px 18px;box-sizing:border-box;animation:dm-pilot-in 280ms cubic-bezier(0.22,1,0.36,1);}",
      "#" + DIALOG_ID + "-root[data-closing] #" + DIALOG_ID + "-backdrop{animation:dm-pilot-fade-out 240ms ease forwards;}",
      "#" + DIALOG_ID + "-root[data-closing] #" + DIALOG_ID + "{animation:dm-pilot-out 240ms ease forwards;}",
      "@keyframes dm-pilot-fade{from{opacity:0;}to{opacity:1;}}",
      "@keyframes dm-pilot-fade-out{from{opacity:1;}to{opacity:0;}}",
      "@keyframes dm-pilot-in{from{opacity:0;transform:translateY(12px) scale(0.985);}to{opacity:1;transform:none;}}",
      "@keyframes dm-pilot-out{from{opacity:1;transform:none;}to{opacity:0;transform:translateY(10px) scale(0.985);}}",
      "#" + DIALOG_ID + " .dm-pilot-head{flex:none;margin:0 36px 14px 0;}",
      "#" + DIALOG_ID + " .dm-pilot-eyebrow{margin:0 0 8px;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-steel,#2f6193);}",
      "#" + DIALOG_ID + " .dm-pilot-title{margin:0;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:clamp(1.35rem,3.6vw,1.55rem);font-weight:700;letter-spacing:-0.025em;line-height:1.15;color:var(--ink-cold,#10161d);text-wrap:balance;}",
      "#" + DIALOG_ID + " .dm-pilot-close{position:absolute;top:12px;right:12px;width:32px;height:32px;border:1px solid rgba(31,45,61,0.1);border-radius:999px;background:#fff;color:var(--ink-quiet,#3c4955);cursor:pointer;display:grid;place-items:center;z-index:2;}",
      "#" + DIALOG_ID + " .dm-pilot-close:hover{border-color:rgba(31,45,61,0.18);color:var(--ink-cold,#10161d);}",
      "#" + DIALOG_ID + " #dm-pilot-form{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;gap:0;}",
      "#" + DIALOG_ID + " .dm-pilot-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-bottom:2px;}",
      "#" + DIALOG_ID + " .dm-pilot-span{grid-column:1 / -1;}",
      "#" + DIALOG_ID + " label{display:flex;flex-direction:column;gap:5px;align-items:stretch;text-align:left;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-dim,#7b8794);}",
      "#" + DIALOG_ID + " label.dm-pilot-req > .dm-pilot-label{display:inline-flex;align-items:baseline;gap:3px;}",
      "#" + DIALOG_ID + " .dm-pilot-req-mark{color:#dc3a52;font-weight:700;line-height:1;}",
      "#" + DIALOG_ID + " input,#" + DIALOG_ID + " textarea{width:100%;box-sizing:border-box;margin:0;padding:10px 11px;border-radius:9px;border:1px solid rgba(31,45,61,0.14);background:#fff;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);font-size:16px;font-weight:500;letter-spacing:0;text-transform:none;color:var(--ink-cold,#10161d);outline:none;}",
      "#" + DIALOG_ID + " input:focus,#" + DIALOG_ID + " textarea:focus{border-color:color-mix(in srgb,#2f6193 55%,transparent);box-shadow:0 0 0 3px rgba(47,97,147,0.14);}",
      "#" + DIALOG_ID + " input.dm-pilot-invalid,#" + DIALOG_ID + " textarea.dm-pilot-invalid{border-color:color-mix(in srgb,#dc3a52 55%,transparent);box-shadow:0 0 0 3px rgba(220,58,82,0.12);}",
      "#" + DIALOG_ID + " textarea{min-height:88px;resize:vertical;}",
      "#" + DIALOG_ID + " .dm-pilot-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}",
      "#" + DIALOG_ID + " .dm-pilot-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:14px;flex:none;padding-top:4px;background:#fff;}",
      "#" + DIALOG_ID + " .dm-pilot-actions{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-width:0;}",
      "#" + DIALOG_ID + " .dm-pilot-submit{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 22px;border-radius:999px;border:1px solid color-mix(in srgb,#2f6193 50%,rgba(255,255,255,0.22));background:linear-gradient(180deg,#3d72a8,#2f6193);color:#fff;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:12px;font-weight:500;letter-spacing:0.03em;text-transform:uppercase;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 8px 20px rgba(20,46,82,0.16);transition:background 240ms ease,border-color 240ms ease,box-shadow 240ms ease,filter 180ms ease;}",
      "#" + DIALOG_ID + " .dm-pilot-submit:hover{filter:brightness(1.03);}",
      "#" + DIALOG_ID + " .dm-pilot-submit:disabled{opacity:0.72;cursor:wait;filter:none;}",
      "#" + DIALOG_ID + " .dm-pilot-submit .dm-pilot-submit-check{display:none;width:15px;height:15px;stroke:currentColor;stroke-width:2.6;fill:none;stroke-linecap:round;stroke-linejoin:round;}",
      "#" + DIALOG_ID + " .dm-pilot-submit .dm-pilot-submit-label{display:inline-block;}",
      "#" + DIALOG_ID + " .dm-pilot-status{margin:0;min-height:0;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);font-size:13px;line-height:1.35;color:var(--ink-quiet,#3c4955);}",
      "#" + DIALOG_ID + " .dm-pilot-status:empty{display:none;}",
      "#" + DIALOG_ID + " .dm-pilot-status[data-tone=error]{color:#dc3a52;}",
      "#" + DIALOG_ID + " .dm-pilot-mark{flex:none;width:24px;height:27px;color:var(--ink-steel,#2f6193);opacity:0.9;align-self:flex-end;transform-origin:50% 58%;transition:color 420ms ease,opacity 420ms ease;}",
      /* 0.5 rev/s → 2s per full turn while the request is in flight. */
      "@keyframes dm-pilot-drum-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}",
      "@keyframes dm-pilot-drum-bounce{0%,100%{transform:translateY(0);}28%{transform:translateY(-11px);}52%{transform:translateY(0);}72%{transform:translateY(-5px);}88%{transform:translateY(0);}}",
      "@keyframes dm-pilot-drum-shake{0%,100%{transform:translateX(0) rotate(0deg);}12%{transform:translateX(-6px) rotate(-9deg);}24%{transform:translateX(6px) rotate(8deg);}36%{transform:translateX(-5px) rotate(-6deg);}48%{transform:translateX(5px) rotate(5deg);}60%{transform:translateX(-3px) rotate(-3deg);}72%{transform:translateX(3px) rotate(2deg);}84%{transform:translateX(-1px) rotate(-1deg);}}",
      "@keyframes dm-pilot-sent-pulse{0%{transform:scale(1);}35%{transform:scale(1.045);}100%{transform:scale(1);}}",
      "@keyframes dm-pilot-check-draw{to{stroke-dashoffset:0;}}",
      "#" + DIALOG_ID + " .dm-pilot-mark.is-error{color:#dc3a52;opacity:1;}",
      "#" + DIALOG_ID + " .dm-pilot-mark.is-shaking{animation:dm-pilot-drum-shake 460ms cubic-bezier(0.36,0.07,0.19,0.97) both;}",
      "#" + DIALOG_ID + "[data-state=sending] .dm-pilot-mark{animation:dm-pilot-drum-spin 2s linear infinite;}",
      "#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit{background:linear-gradient(180deg,#3f8f6d,#2e9e6b);border-color:color-mix(in srgb,#2e9e6b 55%,rgba(255,255,255,0.22));box-shadow:inset 0 1px 0 rgba(255,255,255,0.22),0 8px 20px rgba(46,158,107,0.22);opacity:1;cursor:default;filter:none;animation:dm-pilot-sent-pulse 360ms cubic-bezier(0.16,1,0.3,1);}",
      "#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit:hover{filter:none;}",
      "#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit:disabled{opacity:1;cursor:default;}",
      "#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit .dm-pilot-submit-check{display:block;stroke-dasharray:26;stroke-dashoffset:26;animation:dm-pilot-check-draw 280ms cubic-bezier(0.65,0,0.35,1) 40ms forwards;}",
      "#" + DIALOG_ID + "[data-state=success] .dm-pilot-mark{animation:dm-pilot-drum-bounce 400ms cubic-bezier(0.22,1,0.36,1) both;}",
      /* Mobile sheet: single-scroll bottom sheet, sticky head + foot, grab handle. */
      "@media (max-width:520px){",
      "  #" + DIALOG_ID + "-root{align-items:flex-end;justify-content:stretch;padding:0;inset:auto;top:var(--dm-vv-offset-top,0px);left:var(--dm-vv-offset-left,0px);width:var(--dm-vv-width,100%);height:var(--dm-vv-height,100dvh);}",
      /* Dialog IS the scroller  -  one scroll, no nested hunt. */
      "  #" + DIALOG_ID + "{display:block;width:100%;max-width:none;height:auto;max-height:min(88%,calc(var(--dm-vv-height,100dvh) - 10px));overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;scroll-padding-top:78px;scroll-padding-bottom:84px;border-radius:18px 18px 0 0;padding:0 15px calc(8px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 44px rgba(16,22,29,0.2);}",
      /* Grab handle sits atop the sticky header. */
      "  #" + DIALOG_ID + " .dm-pilot-head{position:sticky;top:0;z-index:3;margin:0 30px 8px 0;padding:16px 0 8px;background:linear-gradient(180deg,#fff 72%,rgba(255,255,255,0));}",
      "  #" + DIALOG_ID + " .dm-pilot-head::before{content:\"\";position:absolute;top:6px;left:calc(50% - 18px + 15px);width:36px;height:4px;border-radius:999px;background:rgba(31,45,61,0.18);}",
      "  #" + DIALOG_ID + " .dm-pilot-eyebrow{margin:6px 0 3px;font-size:10px;letter-spacing:0.14em;}",
      "  #" + DIALOG_ID + " .dm-pilot-title{font-size:1.18rem;line-height:1.2;}",
      "  #" + DIALOG_ID + " .dm-pilot-close{position:fixed;top:calc(var(--dm-vv-offset-top,0px) + 10px);right:14px;width:30px;height:30px;background:rgba(255,255,255,0.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}",
      "  #" + DIALOG_ID + " #dm-pilot-form{display:block;}",
      "  #" + DIALOG_ID + " .dm-pilot-grid{grid-template-columns:1fr;gap:11px;overflow:visible;min-height:0;padding-bottom:0;}",
      "  #" + DIALOG_ID + " label{gap:4px;font-size:9.5px;}",
      "  #" + DIALOG_ID + " input,#" + DIALOG_ID + " textarea{padding:11px 12px;border-radius:10px;font-size:16px;}",
      "  #" + DIALOG_ID + " textarea{min-height:88px;resize:none;}",
      /* Sticky footer keeps Send always reachable  -  no scroll hunt. */
      "  #" + DIALOG_ID + " .dm-pilot-foot{position:sticky;bottom:0;z-index:3;margin-top:12px;gap:10px;padding:10px 0 calc(4px + env(safe-area-inset-bottom,0px));background:linear-gradient(0deg,#fff 72%,rgba(255,255,255,0));}",
      "  #" + DIALOG_ID + " .dm-pilot-submit{height:44px;padding:0 22px;flex:1 1 auto;}",
      "  #" + DIALOG_ID + " .dm-pilot-actions{flex:1 1 auto;}",
      "  #" + DIALOG_ID + " .dm-pilot-mark{width:22px;height:25px;}",
      /* Keyboard open: tighten header chrome, keep single scroll intact. */
      "  #" + DIALOG_ID + "-root[data-kb=\"1\"] #" + DIALOG_ID + "{max-height:calc(var(--dm-vv-height,100dvh) - 4px);border-radius:14px 14px 0 0;}",
      "  #" + DIALOG_ID + "-root[data-kb=\"1\"] #" + DIALOG_ID + " .dm-pilot-head{padding-top:12px;}",
      "  #" + DIALOG_ID + "-root[data-kb=\"1\"] #" + DIALOG_ID + " .dm-pilot-eyebrow{display:none;}",
      "  #" + DIALOG_ID + "-root[data-kb=\"1\"] #" + DIALOG_ID + " .dm-pilot-title{font-size:1.05rem;}",
      "}",
      "@media (max-height:700px) and (min-width:521px){#" + DIALOG_ID + "{padding-top:18px;padding-bottom:14px;}#" + DIALOG_ID + " .dm-pilot-head{margin-bottom:12px;}#" + DIALOG_ID + " textarea{min-height:72px;}}",
      "@media (prefers-reduced-motion:reduce){#" + DIALOG_ID + "-backdrop,#" + DIALOG_ID + ",#" + DIALOG_ID + "-root[data-closing] #" + DIALOG_ID + "-backdrop,#" + DIALOG_ID + "-root[data-closing] #" + DIALOG_ID + ",#" + DIALOG_ID + "[data-state=sending] .dm-pilot-mark,#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit,#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit .dm-pilot-submit-check,#" + DIALOG_ID + "[data-state=success] .dm-pilot-mark,#" + DIALOG_ID + " .dm-pilot-mark.is-shaking{animation:none;}#" + DIALOG_ID + "[data-state=success] .dm-pilot-submit .dm-pilot-submit-check{stroke-dashoffset:0;}}"
    ].join("");
    document.head.appendChild(style);
  }

  var MARK_SVG = '<svg class="dm-toast-mark" viewBox="0 0 476 520" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"></path><path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"></path></svg>';

  var toastTimer = null;
  var successCloseTimer = null;
  var lastFocus = null;
  var vvBound = false;

  function isMobilePilotSheet() {
    return window.matchMedia && window.matchMedia("(max-width:520px)").matches;
  }

  function syncPilotViewport() {
    if (!dialogRoot || dialogRoot.hidden) return;
    var vv = window.visualViewport;
    var h = vv ? vv.height : window.innerHeight;
    var w = vv ? vv.width : window.innerWidth;
    var top = vv ? vv.offsetTop : 0;
    var left = vv ? vv.offsetLeft : 0;
    dialogRoot.style.setProperty("--dm-vv-height", h + "px");
    dialogRoot.style.setProperty("--dm-vv-width", w + "px");
    dialogRoot.style.setProperty("--dm-vv-offset-top", top + "px");
    dialogRoot.style.setProperty("--dm-vv-offset-left", left + "px");
    // Keyboard open when visual viewport is clearly shorter than layout viewport.
    var layoutH = window.innerHeight || h;
    var kb = isMobilePilotSheet() && h < layoutH * 0.82;
    if (kb) dialogRoot.setAttribute("data-kb", "1");
    else dialogRoot.removeAttribute("data-kb");
  }

  function bindPilotViewport() {
    if (vvBound) return;
    vvBound = true;
    var vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", syncPilotViewport);
      vv.addEventListener("scroll", syncPilotViewport);
    }
    window.addEventListener("resize", syncPilotViewport);
  }

  function unbindPilotViewport() {
    if (!vvBound) return;
    vvBound = false;
    var vv = window.visualViewport;
    if (vv) {
      vv.removeEventListener("resize", syncPilotViewport);
      vv.removeEventListener("scroll", syncPilotViewport);
    }
    window.removeEventListener("resize", syncPilotViewport);
  }

  function clearPilotViewport() {
    if (!dialogRoot) return;
    dialogRoot.removeAttribute("data-kb");
    dialogRoot.style.removeProperty("--dm-vv-height");
    dialogRoot.style.removeProperty("--dm-vv-width");
    dialogRoot.style.removeProperty("--dm-vv-offset-top");
    dialogRoot.style.removeProperty("--dm-vv-offset-left");
  }

  function scrollPilotFieldIntoView(el) {
    if (!el || !dialogRoot || dialogRoot.hidden) return;
    var grid = dialogRoot.querySelector(".dm-pilot-grid");
    if (!grid) return;
    // Wait a beat for the keyboard / visualViewport settle.
    setTimeout(function () {
      if (!el.isConnected) return;
      try {
        el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      } catch (_) {
        el.scrollIntoView(false);
      }
    }, 80);
  }
  var dialogRoot = null;
  var formOpenedAt = 0;
  var REQ_FIELDS = ["name", "role", "organization", "email", "message"];
  /* Bounce plays 400ms, then a short luxury beat before dismiss. */
  var DRUM_BOUNCE_MS = 400;
  var LUXURY_HOLD_MS = 750;
  var SUCCESS_HOLD_MS = DRUM_BOUNCE_MS + LUXURY_HOLD_MS;
  var CLOSE_ANIM_MS = 260;

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
    var mark = '<svg class="dm-pilot-mark" viewBox="0 0 476 520" fill="none" stroke="currentColor" stroke-width="34" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"></path><path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"></path></svg>';
    dialogRoot.innerHTML = [
      '<div id="' + DIALOG_ID + '-backdrop" data-pilot-dismiss></div>',
      '<div id="' + DIALOG_ID + '" role="dialog" aria-modal="true" aria-labelledby="dm-pilot-title" data-state="form">',
      '  <button type="button" class="dm-pilot-close" aria-label="Close" data-pilot-dismiss>',
      '    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      "  </button>",
      '  <div class="dm-pilot-head">',
      '    <p class="dm-pilot-eyebrow">Start a pilot</p>',
      '    <h2 class="dm-pilot-title" id="dm-pilot-title">Clinical investigation, rewired.</h2>',
      "  </div>",
      '  <form id="dm-pilot-form" novalidate>',
      '    <div class="dm-pilot-grid">',
      '      <label class="dm-pilot-req"><span class="dm-pilot-label">Name<span class="dm-pilot-req-mark" aria-hidden="true">*</span></span><input name="name" type="text" autocomplete="name" required maxlength="120"></label>',
      '      <label class="dm-pilot-req"><span class="dm-pilot-label">Role<span class="dm-pilot-req-mark" aria-hidden="true">*</span></span><input name="role" type="text" autocomplete="organization-title" required maxlength="120"></label>',
      '      <label class="dm-pilot-req dm-pilot-span"><span class="dm-pilot-label">Organization<span class="dm-pilot-req-mark" aria-hidden="true">*</span></span><input name="organization" type="text" autocomplete="organization" required maxlength="160"></label>',
      '      <label class="dm-pilot-req dm-pilot-span"><span class="dm-pilot-label">Email<span class="dm-pilot-req-mark" aria-hidden="true">*</span></span><input name="email" type="email" autocomplete="email" required maxlength="254"></label>',
      '      <label class="dm-pilot-req dm-pilot-span"><span class="dm-pilot-label">What you&rsquo;re working on<span class="dm-pilot-req-mark" aria-hidden="true">*</span></span><textarea name="message" required maxlength="4000"></textarea></label>',
      '      <label class="dm-pilot-hp" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label>',
      "    </div>",
      '    <div class="dm-pilot-foot">',
      '      <div class="dm-pilot-actions">',
      '        <button type="submit" class="dm-pilot-submit">',
      '          <svg class="dm-pilot-submit-check" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      '          <span class="dm-pilot-submit-label">Send</span>',
      "        </button>",
      '        <p class="dm-pilot-status" role="status" aria-live="polite"></p>',
      "      </div>",
      mark,
      "    </div>",
      "  </form>",
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
    form.addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.classList) t.classList.remove("dm-pilot-invalid");
    });
    form.addEventListener("focusin", function (e) {
      var t = e.target;
      if (!t || (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA")) return;
      syncPilotViewport();
      scrollPilotFieldIntoView(t);
    });

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

  function clearFieldErrors(form) {
    if (!form) return;
    var nodes = form.querySelectorAll(".dm-pilot-invalid");
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove("dm-pilot-invalid");
  }

  function validateRequired(form) {
    var missing = [];
    var firstBad = null;
    for (var i = 0; i < REQ_FIELDS.length; i++) {
      var el = form.querySelector('[name="' + REQ_FIELDS[i] + '"]');
      if (!el) continue;
      var empty = !String(el.value || "").trim();
      var badEmail = REQ_FIELDS[i] === "email" && !empty && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(el.value).trim());
      if (empty || badEmail) {
        el.classList.add("dm-pilot-invalid");
        missing.push(REQ_FIELDS[i]);
        if (!firstBad) firstBad = el;
      } else {
        el.classList.remove("dm-pilot-invalid");
      }
    }
    return { ok: missing.length === 0, firstBad: firstBad };
  }

  function resetSubmitButton(submit) {
    if (!submit) return;
    submit.disabled = false;
    submit.removeAttribute("aria-label");
    submit.setAttribute("type", "submit");
    var label = submit.querySelector(".dm-pilot-submit-label");
    if (label) label.textContent = "Send";
  }

  function openPilotDialog() {
    var root = ensureDialog();
    clearTimeout(successCloseTimer);
    root.removeAttribute("data-closing");
    lastFocus = document.activeElement;
    var dialog = root.querySelector("#" + DIALOG_ID);
    var form = root.querySelector("#dm-pilot-form");
    var submit = form.querySelector(".dm-pilot-submit");
    var mark = dialog.querySelector(".dm-pilot-mark");
    dialog.setAttribute("data-state", "form");
    form.reset();
    clearFieldErrors(form);
    resetSubmitButton(submit);
    setStatus("", null);
    if (mark) mark.style.animation = "";
    formOpenedAt = Date.now();
    root.hidden = false;
    document.documentElement.style.overflow = "hidden";
    bindPilotViewport();
    syncPilotViewport();
    var first = form.querySelector('input[name="name"]');
    if (first) first.focus();
  }

  function finishClosePilotDialog() {
    if (!dialogRoot) return;
    dialogRoot.hidden = true;
    dialogRoot.removeAttribute("data-closing");
    unbindPilotViewport();
    clearPilotViewport();
    document.documentElement.style.overflow = "";
    var dialog = dialogRoot.querySelector("#" + DIALOG_ID);
    var form = dialogRoot.querySelector("#dm-pilot-form");
    if (dialog) dialog.setAttribute("data-state", "form");
    if (form) {
      clearFieldErrors(form);
      resetSubmitButton(form.querySelector(".dm-pilot-submit"));
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      try { lastFocus.focus(); } catch (_) {}
    }
  }

  function closePilotDialog(animated) {
    if (!dialogRoot || dialogRoot.hidden) return;
    clearTimeout(successCloseTimer);
    if (animated === false || dialogRoot.getAttribute("data-closing") != null) {
      finishClosePilotDialog();
      return;
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finishClosePilotDialog();
      return;
    }
    dialogRoot.setAttribute("data-closing", "");
    successCloseTimer = setTimeout(finishClosePilotDialog, CLOSE_ANIM_MS);
  }

  function showPilotSuccess() {
    var dialog = dialogRoot && dialogRoot.querySelector("#" + DIALOG_ID);
    var form = dialogRoot && dialogRoot.querySelector("#dm-pilot-form");
    var submit = form && form.querySelector(".dm-pilot-submit");
    var mark = dialog && dialog.querySelector(".dm-pilot-mark");
    if (!dialog || !submit) return;
    dialog.setAttribute("data-state", "success");
    setStatus("", null);
    submit.disabled = true;
    submit.setAttribute("type", "button");
    var label = submit.querySelector(".dm-pilot-submit-label");
    if (label) label.textContent = "Sent";
    submit.setAttribute("aria-label", "Sent");
    if (mark) {
      mark.style.animation = "none";
      void mark.offsetWidth;
      mark.style.animation = "";
    }
    clearTimeout(successCloseTimer);
    successCloseTimer = setTimeout(function () { closePilotDialog(true); }, SUCCESS_HOLD_MS);
  }

  function shakePilotMark() {
    var mark = dialogRoot && dialogRoot.querySelector(".dm-pilot-mark");
    if (!mark) return;
    mark.classList.remove("is-shaking");
    void mark.offsetWidth;
    mark.classList.add("is-shaking", "is-error");
    clearTimeout(mark.__dmShakeT);
    clearTimeout(mark.__dmErrT);
    mark.__dmShakeT = setTimeout(function () {
      mark.classList.remove("is-shaking");
    }, 500);
    // Hold the red, then let the color transition ease it back to blue.
    mark.__dmErrT = setTimeout(function () {
      mark.classList.remove("is-error");
    }, 1150);
  }

  function onPilotSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var submit = form.querySelector(".dm-pilot-submit");
    var check = validateRequired(form);
    if (!check.ok) {
      setStatus("", null);
      shakePilotMark();
      if (check.firstBad) check.firstBad.focus();
      return;
    }

    var fd = new FormData(form);
    var payload = {
      name: String(fd.get("name") || ""),
      role: String(fd.get("role") || ""),
      organization: String(fd.get("organization") || ""),
      email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || ""),
      openedAt: formOpenedAt || Date.now()
    };

    submit.disabled = true;
    setStatus("", null);
    var dialog = dialogRoot && dialogRoot.querySelector("#" + DIALOG_ID);
    if (dialog) dialog.setAttribute("data-state", "sending");

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
          if (dialog) dialog.setAttribute("data-state", "form");
          setStatus((body && body.error) || "Could not send. Try again.", "error");
          shakePilotMark();
          submit.disabled = false;
          return;
        }
        showPilotSuccess();
      })
      .catch(function () {
        if (dialog) dialog.setAttribute("data-state", "form");
        setStatus("Network error. Check your connection and try again.", "error");
        shakePilotMark();
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
