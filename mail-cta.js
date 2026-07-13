/**
 * Damaros contact CTAs → branded in-site form → /api/contact
 * Protected by Cloudflare Turnstile (minimal managed widget).
 */
(function () {
  var PILOT_TO = "team@damaros.ai";
  var FOUNDER_TO = "anirudh@damaros.ai";
  var STYLE_ID = "dm-mail-form-style";
  var ROOT_ID = "dm-mail-form";
  var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

  var cachedSiteKey = null;
  var turnstileReady = null;
  var widgetId = null;

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
      eyebrow: "Pilot",
      title: "Start a pilot",
      sub: "Tell us where you’re calling from. It goes straight to the Damaros team.",
      cta: "Send inquiry"
    };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + ROOT_ID + "{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(16,22,29,0.48);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}",
      "#" + ROOT_ID + " .dm-form-card{position:relative;width:min(460px,100%);max-height:min(92vh,720px);overflow:auto;border-radius:18px;background:linear-gradient(165deg,#fbfdff 0%,#f3f7fb 48%,#eaf1f7 100%);border:1px solid rgba(31,45,61,0.12);box-shadow:0 28px 70px rgba(20,40,70,0.28),inset 0 1px 0 rgba(255,255,255,0.85);padding:26px 26px 22px;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);color:#10161d;}",
      "#" + ROOT_ID + " .dm-form-mark{position:absolute;top:-18%;right:-12%;width:220px;height:220px;color:rgba(47,97,147,0.09);pointer-events:none;}",
      "#" + ROOT_ID + " .dm-form-eyebrow{margin:0 0 10px;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10.5px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#2f6193;}",
      "#" + ROOT_ID + " .dm-form-title{margin:0;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:clamp(1.45rem,3.4vw,1.75rem);font-weight:700;letter-spacing:-0.03em;line-height:1.05;color:#10161d;}",
      "#" + ROOT_ID + " .dm-form-sub{margin:10px 0 0;max-width:36ch;font-size:13.5px;line-height:1.5;color:#586674;}",
      "#" + ROOT_ID + " .dm-form-fields{display:flex;flex-direction:column;gap:12px;margin-top:22px;}",
      "#" + ROOT_ID + " .dm-form-field{display:flex;flex-direction:column;gap:6px;}",
      "#" + ROOT_ID + " .dm-form-label{font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#7b8794;}",
      "#" + ROOT_ID + " .dm-form-input,#" + ROOT_ID + " .dm-form-textarea{width:100%;box-sizing:border-box;border-radius:11px;border:1px solid rgba(31,45,61,0.14);background:rgba(255,255,255,0.92);color:#10161d;font:inherit;font-size:14px;padding:11px 13px;outline:none;transition:border-color 140ms ease,box-shadow 140ms ease;}",
      "#" + ROOT_ID + " .dm-form-textarea{min-height:88px;resize:vertical;line-height:1.45;}",
      "#" + ROOT_ID + " .dm-form-input:focus,#" + ROOT_ID + " .dm-form-textarea:focus{border-color:color-mix(in srgb,#2f6193 55%,rgba(31,45,61,0.2));box-shadow:0 0 0 3px rgba(47,97,147,0.14);}",
      "#" + ROOT_ID + " .dm-form-input.dm-invalid,#" + ROOT_ID + " .dm-form-textarea.dm-invalid{border-color:rgba(220,58,82,0.55);}",
      "#" + ROOT_ID + " .dm-form-hp{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;}",
      "#" + ROOT_ID + " .dm-form-captcha{margin-top:4px;min-height:65px;display:flex;align-items:center;}",
      "#" + ROOT_ID + " .dm-form-error{margin:10px 0 0;font-size:12.5px;line-height:1.4;color:#dc3a52;display:none;}",
      "#" + ROOT_ID + " .dm-form-error.dm-show{display:block;}",
      "#" + ROOT_ID + " .dm-form-submit{margin-top:14px;display:inline-flex;align-items:center;justify-content:center;width:100%;height:46px;border-radius:999px;border:1px solid color-mix(in srgb,#2f6193 50%,rgba(255,255,255,0.22));font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;color:#fff;background:linear-gradient(180deg,#3d72a8,#2f6193);box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 8px 20px rgba(20,46,82,0.16);}",
      "#" + ROOT_ID + " .dm-form-submit:disabled{opacity:0.55;cursor:wait;}",
      "#" + ROOT_ID + " .dm-form-submit:not(:disabled):hover{filter:brightness(1.04);}",
      "#" + ROOT_ID + " .dm-form-cancel{margin-top:10px;display:block;width:100%;background:none;border:none;cursor:pointer;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7b8794;padding:8px;}",
      "#" + ROOT_ID + " .dm-form-success{text-align:left;padding:8px 0 4px;}",
      "#" + ROOT_ID + " .dm-form-success h2{margin:0;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:1.6rem;letter-spacing:-0.03em;}",
      "#" + ROOT_ID + " .dm-form-success p{margin:12px 0 0;font-size:14px;line-height:1.55;color:#586674;max-width:34ch;}"
    ].join("");
    document.head.appendChild(style);
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (turnstileReady) return turnstileReady;
    turnstileReady = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = TURNSTILE_SRC;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(s);
    });
    return turnstileReady;
  }

  function getSiteKey() {
    if (cachedSiteKey) return Promise.resolve(cachedSiteKey);
    return fetch("/api/public-config", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (cfg) {
        cachedSiteKey = cfg.turnstileSiteKey || "1x00000000000000000000AA";
        return cachedSiteKey;
      })
      .catch(function () {
        cachedSiteKey = "1x00000000000000000000AA";
        return cachedSiteKey;
      });
  }

  function closeForm() {
    if (widgetId != null && window.turnstile) {
      try { window.turnstile.remove(widgetId); } catch (_) {}
      widgetId = null;
    }
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
        { id: "org", label: "Organization", required: false },
        { id: "note", label: "Message", type: "textarea", required: true, value: "I wanted to get connected regarding Damaros." }
      ];
    }
    if (kind === "privacy") {
      return [
        { id: "name", label: "Your name", required: true },
        { id: "email", label: "Email", type: "email", required: true },
        { id: "note", label: "Your question", type: "textarea", required: true }
      ];
    }
    return [
      { id: "name", label: "Your name", required: true },
      { id: "email", label: "Work email", type: "email", required: true },
      { id: "role", label: "Role / title", required: true },
      { id: "org", label: "Organization", required: true },
      { id: "note", label: "Anything we should know?", type: "textarea", required: false, placeholder: "Timeline, site type, open protocols…" }
    ];
  }

  function collectValues(root) {
    var out = {};
    root.querySelectorAll("[data-field]").forEach(function (el) {
      out[el.getAttribute("data-field")] = el.value || "";
    });
    return out;
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
    card.innerHTML = [
      '<div class="dm-form-success">',
      '  <p class="dm-form-eyebrow">' + escapeHtml(meta.eyebrow) + "</p>",
      '  <h2>Received.</h2>',
      '  <p>Thanks — the Damaros team will follow up directly.</p>',
      '  <button type="button" class="dm-form-submit" data-close style="margin-top:22px;">Done</button>',
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
      return '<div class="dm-form-field">'
        + '<label class="dm-form-label" for="dm-f-' + f.id + '">' + escapeHtml(f.label)
        + (f.required ? "" : " · optional") + "</label>"
        + control
        + "</div>";
    }).join("");

    var root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", meta.title);

    root.innerHTML = [
      '<div class="dm-form-card">',
      '  <svg class="dm-form-mark" viewBox="0 0 476 520" fill="none" stroke="currentColor" stroke-width="30" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"></path><path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"></path></svg>',
      '  <p class="dm-form-eyebrow">' + escapeHtml(meta.eyebrow) + "</p>",
      '  <h2 class="dm-form-title">' + escapeHtml(meta.title) + "</h2>",
      '  <p class="dm-form-sub">' + escapeHtml(meta.sub) + "</p>",
      '  <form class="dm-form-fields" novalidate>',
      fieldHtml,
      '    <div class="dm-form-hp" aria-hidden="true"><label>Company URL<input type="text" name="company_url" data-field="company_url" tabindex="-1" autocomplete="off"></label></div>',
      '    <div class="dm-form-field"><span class="dm-form-label">Security</span><div class="dm-form-captcha" id="dm-turnstile"></div></div>',
      '    <p class="dm-form-error" id="dm-form-error" role="alert"></p>',
      '    <button type="submit" class="dm-form-submit">' + escapeHtml(meta.cta) + "</button>",
      "  </form>",
      '  <button type="button" class="dm-form-cancel">Cancel</button>',
      "</div>"
    ].join("");

    var errEl = null;
    var submitBtn = null;

    function setError(msg) {
      errEl = errEl || root.querySelector("#dm-form-error");
      if (!errEl) return;
      errEl.textContent = msg || "";
      errEl.classList.toggle("dm-show", !!msg);
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

      var token = "";
      if (window.turnstile && widgetId != null) {
        try { token = window.turnstile.getResponse(widgetId) || ""; } catch (_) {}
      }
      if (!token) {
        setError("Complete the security check, then try again.");
        return;
      }

      var values = collectValues(root);
      submitBtn = root.querySelector(".dm-form-submit");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch("/api/contact", {
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
          turnstileToken: token
        })
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { status: r.status, data: data };
          });
        })
        .then(function (res) {
          if (!res.data || !res.data.ok) {
            throw new Error((res.data && res.data.error) || "Could not send");
          }
          showSuccess(root, meta);
        })
        .catch(function (err) {
          setError(err.message || "Could not send. Try again.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = meta.cta;
          }
          if (window.turnstile && widgetId != null) {
            try { window.turnstile.reset(widgetId); } catch (_) {}
          }
        });
    });

    document.body.appendChild(root);
    document.addEventListener("keydown", onKeyDown, true);
    var first = root.querySelector("[data-field]");
    if (first) first.focus();

    Promise.all([getSiteKey(), loadTurnstile()])
      .then(function (pair) {
        var sitekey = pair[0];
        var mount = root.querySelector("#dm-turnstile");
        if (!mount || !window.turnstile) return;
        widgetId = window.turnstile.render(mount, {
          sitekey: sitekey,
          theme: "light",
          size: "flexible",
          appearance: "always"
        });
      })
      .catch(function () {
        setError("Security check unavailable. Refresh and try again.");
      });
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
