/**
 * Damaros contact CTAs → branded in-site form → /api/contact.
 * Quiet anti-spam: honeypot, minimum completion time, and server cooldown.
 */
(function () {
  var PILOT_TO = "team@damaros.ai";
  var FOUNDER_TO = "anirudh@damaros.ai";
  // FormSubmit activated endpoint IDs (replace naked email in FormSubmit URLs).
  var FORMSUBMIT_ID_PILOT = "d197c20e3c24682759665e49b1bb7704";
  var FORMSUBMIT_ID_FOUNDER = "97cb156f8e5b68117d9d615b5456d4f8";
  var STYLE_ID = "dm-mail-form-style";
  var ROOT_ID = "dm-mail-form";
  var MAX_MESSAGE_WORDS = 100;
  // FormSubmit has been observed hanging for 60s+; never let a request block longer than this.
  var FETCH_TIMEOUT_MS = 12000;

  function fetchWithTimeout(url, opts) {
    if (typeof AbortController === "undefined") return fetch(url, opts);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
    opts = opts || {};
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(
      function (r) { clearTimeout(timer); return r; },
      function (err) { clearTimeout(timer); throw err; }
    );
  }

  function parseMailto(href) {
    var raw = String(href || "").replace(/^mailto:/i, "");
    var q = raw.indexOf("?");
    var to = (q >= 0 ? raw.slice(0, q) : raw).trim();
    try { to = decodeURIComponent(to); } catch (_) {}
    var params = new URLSearchParams(q >= 0 ? raw.slice(q + 1) : "");
    var subject = params.get("subject") || "";
    var kind = "pilot";
    if (to.toLowerCase() === FOUNDER_TO || /founder/i.test(subject)) kind = "founder";
    else if (/privacy/i.test(subject)) kind = "privacy";
    return { to: to, subject: subject, kind: kind };
  }

  function kindMeta(kind) {
    if (kind === "founder") {
      return {
        eyebrow: "Founder",
        title: "Get in touch",
        sub: "Send a note directly to Anirudh. We’ll reply from Damaros.",
        cta: "Send message"
      };
    }
    if (kind === "privacy") {
      return {
        eyebrow: "Privacy",
        title: "Privacy question",
        sub: "Ask about this policy or your information.",
        cta: "Send message"
      };
    }
    return {
      eyebrow: "Inquiry",
      title: "Clinical trials, rewired.",
      sub: "",
      cta: "Send inquiry"
    };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + ROOT_ID + "{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) max(12px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));box-sizing:border-box;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:rgba(16,22,29,0.48);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}",
      "#" + ROOT_ID + " .dm-form-card{position:relative;box-sizing:border-box;overflow:auto;width:min(560px,100%);max-height:min(920px,calc(100dvh - 24px));margin:auto;border-radius:20px;background:linear-gradient(170deg,#ffffff 0%,#f6f9fc 60%,#eef4f9 100%);border:1px solid rgba(31,45,61,0.12);box-shadow:0 28px 70px rgba(20,40,70,0.28),inset 0 1px 0 rgba(255,255,255,0.9);padding:clamp(18px,3.2vw,30px);font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);color:#10161d;animation:dm-form-in 260ms cubic-bezier(0.22,1,0.36,1);}",
      "@keyframes dm-form-in{from{opacity:0;transform:translateY(14px) scale(0.985);}to{opacity:1;transform:none;}}",
      "#" + ROOT_ID + " .dm-form-head{position:relative;min-height:58px;padding-right:clamp(56px,14vw,78px);}",
      "#" + ROOT_ID + " .dm-form-mark{position:absolute;right:2px;top:-2px;width:clamp(36px,9vw,48px);height:clamp(40px,10vw,54px);color:#2f6193;filter:drop-shadow(0 6px 10px rgba(47,97,147,0.16));transform-origin:center;will-change:transform;animation:dm-drum-drift 15s ease-in-out infinite;pointer-events:none;}",
      "@keyframes dm-drum-drift{0%,100%{transform:rotate(-4.5deg);}50%{transform:rotate(4.5deg);}}",
      "#" + ROOT_ID + " .dm-form-eyebrow{margin:0 0 6px;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10.5px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#2f6193;}",
      "#" + ROOT_ID + " .dm-form-title{margin:0;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:clamp(1.2rem,4.2vw,1.6rem);font-weight:700;letter-spacing:-0.035em;line-height:1.1;color:#10161d;text-wrap:balance;}",
      "#" + ROOT_ID + " .dm-form-title span{color:#5f7588;}",
      "#" + ROOT_ID + " .dm-form-sub{margin:10px 0 0;max-width:40ch;font-size:clamp(12.5px,2.8vw,13.5px);line-height:1.5;color:#586674;}",
      "#" + ROOT_ID + " .dm-form-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:22px;}",
      "#" + ROOT_ID + " .dm-form-field{display:flex;flex-direction:column;gap:7px;min-width:0;}",
      "#" + ROOT_ID + " .dm-form-field.dm-form-wide{grid-column:1 / -1;}",
      "#" + ROOT_ID + " .dm-form-label{font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#64707c;transition:color 140ms ease;}",
      "#" + ROOT_ID + " .dm-form-field:focus-within .dm-form-label{color:#2f6193;}",
      "#" + ROOT_ID + " .dm-form-input,#" + ROOT_ID + " .dm-form-textarea{width:100%;max-width:100%;box-sizing:border-box;border-radius:12px;border:1px solid rgba(31,45,61,0.14);background:#fff;color:#10161d;font:inherit;font-size:16px;padding:12px 14px;outline:none;box-shadow:inset 0 1px 2px rgba(20,40,70,0.05);transition:border-color 140ms ease,box-shadow 140ms ease,background 140ms ease;-webkit-appearance:none;appearance:none;}",
      "#" + ROOT_ID + " .dm-form-input::placeholder,#" + ROOT_ID + " .dm-form-textarea::placeholder{color:#a3aeb9;}",
      "#" + ROOT_ID + " .dm-form-input:hover,#" + ROOT_ID + " .dm-form-textarea:hover{border-color:rgba(47,97,147,0.35);}",
      "#" + ROOT_ID + " .dm-form-textarea{min-height:88px;max-height:min(150px,28vh);resize:vertical;line-height:1.5;}",
      "#" + ROOT_ID + " .dm-form-input:focus,#" + ROOT_ID + " .dm-form-textarea:focus{border-color:#2f6193;box-shadow:0 0 0 3px rgba(47,97,147,0.14),inset 0 1px 2px rgba(20,40,70,0.04);}",
      "#" + ROOT_ID + " .dm-form-input.dm-invalid,#" + ROOT_ID + " .dm-form-textarea.dm-invalid{border-color:rgba(220,58,82,0.55);}",
      "#" + ROOT_ID + " .dm-form-hp{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;}",
      "#" + ROOT_ID + " .dm-form-word-count{grid-column:1 / -1;margin:0;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10px;letter-spacing:0.06em;text-align:right;color:#7b8794;}",
      "#" + ROOT_ID + " .dm-form-error{grid-column:1 / -1;margin:10px 0 0;font-size:12.5px;line-height:1.4;color:#dc3a52;display:none;}",
      "#" + ROOT_ID + " .dm-form-error.dm-show{display:block;}",
      "#" + ROOT_ID + " .dm-form-submit{grid-column:1 / -1;margin-top:14px;display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:46px;height:46px;border-radius:999px;border:1px solid color-mix(in srgb,#2f6193 50%,rgba(255,255,255,0.22));font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;color:#fff;background:linear-gradient(180deg,#3d72a8,#2f6193);box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 8px 20px rgba(20,46,82,0.16);transition:transform 130ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 130ms ease,filter 130ms ease,letter-spacing 200ms ease;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}",
      "#" + ROOT_ID + " .dm-form-submit:not(:disabled):hover{filter:brightness(1.05);transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.22),0 12px 26px rgba(20,46,82,0.22);}",
      "#" + ROOT_ID + " .dm-form-submit:not(:disabled):active{transform:translateY(1px) scale(0.982);box-shadow:inset 0 2px 4px rgba(11,26,44,0.28),0 3px 8px rgba(20,46,82,0.14);filter:brightness(0.97);}",
      "#" + ROOT_ID + " .dm-form-submit:disabled{cursor:wait;}",
      "#" + ROOT_ID + " .dm-form-submit.dm-sending{background:linear-gradient(180deg,#345f8c,#274f78);letter-spacing:0.14em;transform:scale(0.99);box-shadow:inset 0 2px 5px rgba(11,26,44,0.3),0 4px 12px rgba(20,46,82,0.14);animation:dm-send-hold 1.5s ease-in-out infinite;}",
      "#" + ROOT_ID + " .dm-form-submit.dm-sending::after{content:\"\";display:inline-block;width:1.4em;text-align:left;animation:dm-send-dots 1.2s steps(4,end) infinite;}",
      "@keyframes dm-send-hold{0%,100%{filter:brightness(1);}50%{filter:brightness(1.08);}}",
      "@keyframes dm-send-dots{0%{content:\"\";}25%{content:\".\";}50%{content:\"..\";}75%{content:\"...\";}100%{content:\"\";}}",
      "#" + ROOT_ID + " .dm-form-cancel{margin-top:10px;display:block;width:100%;min-height:40px;background:none;border:none;cursor:pointer;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7b8794;padding:8px;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}",
      "#" + ROOT_ID + " .dm-form-card.dm-form-compact{width:min(360px,100%);max-height:none;padding:clamp(18px,4vw,24px);}",
      "#" + ROOT_ID + " .dm-form-compact .dm-form-mark{width:36px;height:40px;top:0;}",
      "#" + ROOT_ID + " .dm-form-compact .dm-form-head{min-height:0;padding-right:52px;}",
      "#" + ROOT_ID + " .dm-form-compact .dm-form-title{font-size:clamp(1.15rem,4vw,1.35rem);}",
      "#" + ROOT_ID + " .dm-form-success{text-align:left;padding:0;}",
      "#" + ROOT_ID + " .dm-form-success p{margin:8px 0 0;font-size:clamp(12.5px,3.2vw,13.5px);line-height:1.45;color:#586674;}",
      "#" + ROOT_ID + " .dm-form-done{width:auto;min-width:112px;height:36px;min-height:36px;margin-top:16px;padding:0 28px;}",
      "@media (min-width:640px){#" + ROOT_ID + " .dm-form-input,#" + ROOT_ID + " .dm-form-textarea{font-size:14px;}}",
      "@media (max-width:560px){#" + ROOT_ID + "{align-items:flex-start;padding:max(10px,env(safe-area-inset-top,0px)) max(10px,env(safe-area-inset-right,0px)) max(10px,env(safe-area-inset-bottom,0px)) max(10px,env(safe-area-inset-left,0px));}#" + ROOT_ID + " .dm-form-card{width:100%;max-height:none;border-radius:16px;padding:18px 16px;}#" + ROOT_ID + " .dm-form-fields{grid-template-columns:1fr;gap:12px;margin-top:18px;}#" + ROOT_ID + " .dm-form-field.dm-form-wide{grid-column:auto;}#" + ROOT_ID + " .dm-form-textarea{min-height:96px;max-height:160px;}#" + ROOT_ID + " .dm-form-card.dm-form-compact{width:100%;max-width:360px;margin:auto;padding:20px 18px;}#" + ROOT_ID + " .dm-form-done{width:100%;}}",
      "@media (max-height:700px){#" + ROOT_ID + " .dm-form-card{padding:16px 18px;}#" + ROOT_ID + " .dm-form-head{min-height:48px;}#" + ROOT_ID + " .dm-form-fields{margin-top:14px;gap:10px;}#" + ROOT_ID + " .dm-form-textarea{min-height:64px;max-height:96px;}#" + ROOT_ID + " .dm-form-submit{height:42px;min-height:42px;margin-top:10px;}#" + ROOT_ID + " .dm-form-cancel{margin-top:4px;padding:6px;min-height:36px;}}",
      "@media (max-height:560px){#" + ROOT_ID + "{align-items:flex-start;}#" + ROOT_ID + " .dm-form-card{max-height:none;}#" + ROOT_ID + " .dm-form-sub{margin-top:6px;font-size:12.5px;}#" + ROOT_ID + " .dm-form-fields{margin-top:10px;gap:8px;}#" + ROOT_ID + " .dm-form-input,#" + ROOT_ID + " .dm-form-textarea{padding:9px 11px;}#" + ROOT_ID + " .dm-form-textarea{min-height:52px;max-height:72px;resize:none;}}",
      "@media (prefers-reduced-motion:reduce){#" + ROOT_ID + " .dm-form-card,#" + ROOT_ID + " .dm-form-mark,#" + ROOT_ID + " .dm-form-submit{animation:none;transition:none;}#" + ROOT_ID + " .dm-form-submit.dm-sending::after{animation:none;content:\"...\";}}"
    ].join("");
    document.head.appendChild(style);
  }

  function closeForm() {
    var root = document.getElementById(ROOT_ID);
    if (root) root.remove();
    document.removeEventListener("keydown", onKeyDown, true);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") closeForm();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fieldsFor(kind) {
    if (kind === "founder") {
      return [
        { id: "name", label: "Your name", required: true },
        { id: "email", label: "Work email", type: "email", required: true },
        { id: "org", label: "Organization", required: true },
        { id: "note", label: "Context", type: "textarea", required: true, value: "I wanted to get connected regarding Damaros." }
      ];
    }
    if (kind === "privacy") {
      return [
        { id: "name", label: "Your name", required: true },
        { id: "email", label: "Email", type: "email", required: true },
        { id: "note", label: "Context", type: "textarea", required: true }
      ];
    }
    return [
      { id: "name", label: "Your name", required: true },
      { id: "email", label: "Work email", type: "email", required: true },
      { id: "role", label: "Role / title", required: true },
      { id: "org", label: "Organization", required: true },
      { id: "note", label: "Context", type: "textarea", required: true, placeholder: "What should we know about your site, protocols, or timeline?" }
    ];
  }

  function collectValues(root) {
    var out = {};
    root.querySelectorAll("[data-field]").forEach(function (el) {
      out[el.getAttribute("data-field")] = el.value || "";
    });
    return out;
  }

  function countWords(value) {
    var text = String(value || "").trim();
    return text ? text.split(/\s+/).length : 0;
  }

  function formSubmitIdFor(kind) {
    if (kind === "founder") return FORMSUBMIT_ID_FOUNDER;
    return FORMSUBMIT_ID_PILOT;
  }

  function subjectFor(kind) {
    if (kind === "founder") return "Damaros Founder Inquiry";
    if (kind === "privacy") return "Privacy policy question";
    return "Damaros Pilot Inquiry";
  }

  function inboxFor(kind) {
    return kind === "founder" ? FOUNDER_TO : PILOT_TO;
  }

  function mailtoFallbackHref(kind, values) {
    var body = [
      "Name: " + (values.name || ""),
      "Email: " + (values.email || ""),
      values.role ? "Role/Title: " + values.role : "",
      values.org ? "Organization: " + values.org : "",
      "",
      values.note || ""
    ].filter(function (line) { return line !== ""; }).join("\n");
    return "mailto:" + inboxFor(kind)
      + "?subject=" + encodeURIComponent(subjectFor(kind))
      + "&body=" + encodeURIComponent(body);
  }

  function deliverViaFormSubmit(kind, values) {
    var endpointId = formSubmitIdFor(kind);
    var inbox = inboxFor(kind);
    return fetchWithTimeout("https://formsubmit.co/ajax/" + encodeURIComponent(endpointId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: values.name || "",
        email: values.email || "",
        role: values.role || "",
        organization: values.org || "",
        kind: kind,
        message: values.note || "",
        _subject: subjectFor(kind),
        _template: "table",
        _captcha: "false",
        _replyto: values.email || ""
      })
    }).then(function (r) {
      // FormSubmit has been seen returning malformed / concatenated JSON when
      // degraded; parse defensively instead of surfacing a parse error.
      return r.text().then(function (raw) {
        var data = null;
        try { data = JSON.parse(raw); } catch (_) {}
        return { status: r.status, data: data, raw: raw };
      });
    }).then(function (res) {
      var data = res.data || {};
      var msg = String(data.message || "");
      var ok =
        res.status >= 200 &&
        res.status < 300 &&
        (data.success === true || data.success === "true" || /thank|success|submitted/i.test(msg));
      if (ok) return { ok: true };
      if (/activat/i.test(msg)) {
        throw new Error("Check " + inbox + " for a one-time FormSubmit activation link, then send again.");
      }
      var err = new Error(msg || "Could not send");
      err.dmFromFormSubmit = true;
      throw err;
    }).catch(function (err) {
      // Tag so the caller never re-enters FormSubmit delivery on failure.
      if (err && !err.dmFromFormSubmit) err.dmFromFormSubmit = true;
      throw err;
    });
  }

  function validate(root, kind) {
    var ok = true;
    fieldsFor(kind).forEach(function (f) {
      var el = root.querySelector('[data-field="' + f.id + '"]');
      if (!el) return;
      var val = (el.value || "").trim();
      var bad = f.required && !val;
      if (f.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) bad = true;
      el.classList.toggle("dm-invalid", bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function showSuccess(root, meta) {
    var card = root.querySelector(".dm-form-card");
    var mark = card.querySelector(".dm-form-mark");
    var markHtml = mark ? mark.outerHTML : "";
    card.classList.add("dm-form-compact");
    card.innerHTML = [
      '<div class="dm-form-success">',
      '  <div class="dm-form-head">',
      '    <p class="dm-form-eyebrow">' + escapeHtml(meta.eyebrow) + "</p>",
      '    <h2 class="dm-form-title">Received.</h2>',
      "    " + markHtml,
      "  </div>",
      '  <p>We will follow up directly.</p>',
      '  <button type="button" class="dm-form-submit dm-form-done" data-close>Done</button>',
      "</div>"
    ].join("");
    card.querySelector("[data-close]").addEventListener("click", closeForm);
  }

  function openForm(parsed) {
    closeForm();
    ensureStyles();
    var meta = kindMeta(parsed.kind);
    var fields = fieldsFor(parsed.kind);

    var fieldHtml = fields.map(function (f) {
      var inputType = f.type === "email" ? "email" : "text";
      var common = 'data-field="' + f.id + '" id="dm-f-' + f.id + '" class="'
        + (f.type === "textarea" ? "dm-form-textarea" : "dm-form-input") + '"'
        + (f.required ? " required" : "")
        + (f.placeholder ? ' placeholder="' + escapeHtml(f.placeholder) + '"' : "");
      var control = f.type === "textarea"
        ? "<textarea " + common + ">" + escapeHtml(f.value || "") + "</textarea>"
        : '<input type="' + inputType + '" ' + common
          + (f.value ? ' value="' + escapeHtml(f.value) + '"' : "")
          + ' autocomplete="' + (f.id === "email" ? "email" : f.id === "name" ? "name" : "on") + '">';
      var fieldClass = f.type === "textarea" ? "dm-form-field dm-form-wide" : "dm-form-field";
      return '<div class="' + fieldClass + '">'
        + '<label class="dm-form-label" for="dm-f-' + f.id + '">' + escapeHtml(f.label) + "</label>"
        + control
        + "</div>";
    }).join("");

    var root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", meta.title || meta.eyebrow);

    var markSvg = '<svg class="dm-form-mark" viewBox="0 0 476 520" fill="none" stroke="currentColor" stroke-width="28" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"></path><path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"></path></svg>';
    var titleHtml = parsed.kind === "pilot"
      ? "Clinical trials, <span>rewired.</span>"
      : escapeHtml(meta.title);

    root.innerHTML = [
      '<div class="dm-form-card">',
      '  <div class="dm-form-head">',
      '    <p class="dm-form-eyebrow">' + escapeHtml(meta.eyebrow) + "</p>",
      meta.title ? '    <h2 class="dm-form-title">' + titleHtml + "</h2>" : "",
      "    " + markSvg,
      "  </div>",
      meta.sub ? '  <p class="dm-form-sub">' + escapeHtml(meta.sub) + "</p>" : "",
      '  <form class="dm-form-fields" novalidate>',
      fieldHtml,
      '    <div class="dm-form-hp" aria-hidden="true"><label>Company URL<input type="text" name="company_url" data-field="company_url" tabindex="-1" autocomplete="off"></label></div>',
      '    <p class="dm-form-word-count" data-word-count></p>',
      '    <p class="dm-form-error" id="dm-form-error" role="alert"></p>',
      '    <button type="submit" class="dm-form-submit">' + escapeHtml(meta.cta) + "</button>",
      "  </form>",
      '  <button type="button" class="dm-form-cancel">Cancel</button>',
      "</div>"
    ].join("");

    var openedAt = Date.now();
    var errEl = null;
    var submitBtn = null;
    var noteEl = root.querySelector('[data-field="note"]');
    var countEl = root.querySelector("[data-word-count]");

    function setError(msg) {
      errEl = errEl || root.querySelector("#dm-form-error");
      if (!errEl) return;
      errEl.textContent = msg || "";
      errEl.classList.toggle("dm-show", !!msg);
    }

    function setErrorWithMailto(prefix, href, linkText, suffix) {
      errEl = errEl || root.querySelector("#dm-form-error");
      if (!errEl) return;
      errEl.textContent = "";
      errEl.appendChild(document.createTextNode(prefix));
      var a = document.createElement("a");
      a.href = href;
      a.textContent = linkText;
      // Marks the link so the global mailto interceptor lets the mail client open.
      a.setAttribute("data-dm-native", "");
      a.style.color = "inherit";
      a.style.fontWeight = "600";
      errEl.appendChild(a);
      errEl.appendChild(document.createTextNode(suffix));
      errEl.classList.add("dm-show");
    }

    function updateWordCount() {
      if (!countEl) return;
      var words = countWords(noteEl && noteEl.value);
      countEl.textContent = words + " / " + MAX_MESSAGE_WORDS + " words";
      countEl.style.color = words > MAX_MESSAGE_WORDS ? "#dc3a52" : "";
    }

    if (noteEl) {
      noteEl.addEventListener("input", function () {
        var words = countWords(noteEl.value);
        if (words > MAX_MESSAGE_WORDS) {
          noteEl.value = noteEl.value.trim().split(/\s+/).slice(0, MAX_MESSAGE_WORDS).join(" ");
        }
        updateWordCount();
      });
      updateWordCount();
    }

    root.addEventListener("click", function (e) {
      if (e.target === root || e.target.classList.contains("dm-form-cancel")) {
        e.preventDefault();
        closeForm();
      }
    });

    root.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      setError("");
      if (!validate(root, parsed.kind)) {
        var bad = root.querySelector(".dm-invalid");
        if (bad) bad.focus();
        setError("Please complete the required fields.");
        return;
      }

      if (Date.now() - openedAt < 3000) {
        setError("Take a moment to review your message before sending.");
        return;
      }
      if (countWords(noteEl && noteEl.value) > MAX_MESSAGE_WORDS) {
        setError("Messages are limited to 100 words.");
        return;
      }

      var values = collectValues(root);
      submitBtn = root.querySelector(".dm-form-submit");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("dm-sending");
        submitBtn.textContent = "Sending";
      }

      fetchWithTimeout("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          kind: parsed.kind,
          name: values.name,
          email: values.email,
          role: values.role,
          org: values.org,
          note: values.note,
          company_url: values.company_url,
          openedAt: openedAt
        })
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { status: r.status, data: data };
          }).catch(function () {
            return { status: r.status, data: null };
          });
        })
        .then(function (res) {
          if (res.data && res.data.ok) {
            // API asks the browser to deliver via FormSubmit (no Resend key).
            if (res.data.deliver === "formsubmit") {
              return deliverViaFormSubmit(parsed.kind, values);
            }
            return { ok: true };
          }
          var apiError = (res.data && res.data.error) || "";
          // Fall back to browser FormSubmit when the API can't deliver yet.
          if (
            res.status >= 500 ||
            /not configured|could not deliver|activation/i.test(apiError)
          ) {
            return deliverViaFormSubmit(parsed.kind, values);
          }
          throw new Error(apiError || "Could not send");
        })
        .catch(function (err) {
          // Network / timeout / local static hosts: try FormSubmit from the
          // browser — but never re-enter it if it already failed once.
          var networkish = /failed to fetch|networkerror|load failed|abort/i.test(String((err && err.name) || "") + " " + String((err && err.message) || err));
          if (networkish && !(err && err.dmFromFormSubmit)) {
            return deliverViaFormSubmit(parsed.kind, values);
          }
          throw err;
        })
        .then(function () {
          showSuccess(root, meta);
        })
        .catch(function (err) {
          var raw = String((err && err.message) || err || "");
          var isNetworkish = /failed to fetch|networkerror|load failed|abort|timed? ?out/i.test(String((err && err.name) || "") + " " + raw);
          var isActivation = /activat/i.test(raw);
          if (isActivation || (raw && !isNetworkish && !(err && err.dmFromFormSubmit))) {
            setError(raw);
          } else {
            // Delivery is unreachable — hand off to the mail client, pre-filled.
            setErrorWithMailto(
              "We could not reach our mail service. ",
              mailtoFallbackHref(parsed.kind, values),
              "Email us directly at " + inboxFor(parsed.kind),
              " — your message is pre-filled."
            );
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("dm-sending");
            submitBtn.textContent = meta.cta;
          }
        });
    });

    document.body.appendChild(root);
    document.addEventListener("keydown", onKeyDown, true);
    var first = root.querySelector("[data-field]");
    if (first) first.focus();

  }

  function openMail(href) {
    openForm(parseMailto(href));
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    if (a.hasAttribute("data-dm-native")) return;
    e.preventDefault();
    openMail(a.getAttribute("href"));
  }, true);

  function copyEmail(btn) {
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

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    ta.remove();
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    var btn = e.target && e.target.closest && e.target.closest("[data-copy-email]");
    if (!btn) return;
    e.preventDefault();
    copyEmail(btn);
  }, true);

  window.dmOpenMail = openMail;
})();
