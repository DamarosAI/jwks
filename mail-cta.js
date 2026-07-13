/**
 * Damaros contact CTAs → branded form → native mailto compose.
 */
(function () {
  var PILOT_TO = "team@damaros.ai";
  var FOUNDER_TO = "anirudh@damaros.ai";

  var STYLE_ID = "dm-mail-form-style";
  var ROOT_ID = "dm-mail-form";

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

  function kindMeta(kind, parsed) {
    if (kind === "founder") {
      return {
        eyebrow: "Founder",
        title: "Get in touch",
        sub: "A short note for Anirudh — we’ll reply from Damaros.",
        subject: parsed.subject || "Damaros Founder Inquiry",
        to: parsed.to || FOUNDER_TO,
        cta: "Open mail"
      };
    }
    if (kind === "privacy") {
      return {
        eyebrow: "Privacy",
        title: "Privacy question",
        sub: "Ask about this policy or your information.",
        subject: parsed.subject || "Privacy policy question",
        to: parsed.to || PILOT_TO,
        cta: "Open mail"
      };
    }
    return {
      eyebrow: "Pilot",
      title: "Start a pilot",
      sub: "Tell us where you’re calling from. We’ll open a draft to the Damaros team.",
      subject: parsed.subject || "Damaros Pilot Inquiry",
      to: parsed.to || PILOT_TO,
      cta: "Open mail"
    };
  }

  function mailtoUrl(to, subject, body) {
    return "mailto:" + to
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + ROOT_ID + "{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(16,22,29,0.48);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}",
      "#" + ROOT_ID + " .dm-form-card{position:relative;width:min(440px,100%);overflow:hidden;border-radius:18px;background:linear-gradient(165deg,#fbfdff 0%,#f3f7fb 48%,#eaf1f7 100%);border:1px solid rgba(31,45,61,0.12);box-shadow:0 28px 70px rgba(20,40,70,0.28),inset 0 1px 0 rgba(255,255,255,0.85);padding:26px 26px 22px;font-family:var(--font-body,\"Hanken Grotesk\",system-ui,sans-serif);color:#10161d;}",
      "#" + ROOT_ID + " .dm-form-mark{position:absolute;top:-18%;right:-12%;width:220px;height:220px;color:rgba(47,97,147,0.09);pointer-events:none;}",
      "#" + ROOT_ID + " .dm-form-eyebrow{margin:0 0 10px;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10.5px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#2f6193;}",
      "#" + ROOT_ID + " .dm-form-title{margin:0;font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:clamp(1.45rem,3.4vw,1.75rem);font-weight:700;letter-spacing:-0.03em;line-height:1.05;color:#10161d;}",
      "#" + ROOT_ID + " .dm-form-sub{margin:10px 0 0;max-width:34ch;font-size:13.5px;line-height:1.5;color:#586674;}",
      "#" + ROOT_ID + " .dm-form-fields{display:flex;flex-direction:column;gap:12px;margin-top:22px;}",
      "#" + ROOT_ID + " .dm-form-field{display:flex;flex-direction:column;gap:6px;}",
      "#" + ROOT_ID + " .dm-form-label{font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#7b8794;}",
      "#" + ROOT_ID + " .dm-form-input,#" + ROOT_ID + " .dm-form-textarea{width:100%;box-sizing:border-box;border-radius:11px;border:1px solid rgba(31,45,61,0.14);background:rgba(255,255,255,0.92);color:#10161d;font:inherit;font-size:14px;padding:11px 13px;outline:none;transition:border-color 140ms ease,box-shadow 140ms ease;}",
      "#" + ROOT_ID + " .dm-form-textarea{min-height:88px;resize:vertical;line-height:1.45;}",
      "#" + ROOT_ID + " .dm-form-input:focus,#" + ROOT_ID + " .dm-form-textarea:focus{border-color:color-mix(in srgb,#2f6193 55%,rgba(31,45,61,0.2));box-shadow:0 0 0 3px rgba(47,97,147,0.14);}",
      "#" + ROOT_ID + " .dm-form-input.dm-invalid,#" + ROOT_ID + " .dm-form-textarea.dm-invalid{border-color:rgba(220,58,82,0.55);}",
      "#" + ROOT_ID + " .dm-form-hint{margin:14px 0 0;font-size:12px;line-height:1.4;color:#7b8794;}",
      "#" + ROOT_ID + " .dm-form-submit{margin-top:16px;display:inline-flex;align-items:center;justify-content:center;width:100%;height:46px;border-radius:999px;border:1px solid color-mix(in srgb,#2f6193 50%,rgba(255,255,255,0.22));font-family:var(--font-display,\"Archivo\",system-ui,sans-serif);font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;color:#fff;background:linear-gradient(180deg,#3d72a8,#2f6193);box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 8px 20px rgba(20,46,82,0.16);}",
      "#" + ROOT_ID + " .dm-form-submit:hover{filter:brightness(1.04);}",
      "#" + ROOT_ID + " .dm-form-cancel{margin-top:10px;display:block;width:100%;background:none;border:none;cursor:pointer;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7b8794;padding:8px;}",
      "#" + ROOT_ID + " .dm-form-to{margin-top:10px;font-family:var(--font-mono,\"IBM Plex Mono\",ui-monospace,monospace);font-size:10.5px;letter-spacing:0.04em;color:#7b8794;text-align:center;}"
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
        { id: "org", label: "Organization", required: false },
        { id: "note", label: "Message", type: "textarea", required: true, value: "I wanted to get connected regarding Damaros." }
      ];
    }
    if (kind === "privacy") {
      return [
        { id: "name", label: "Your name", required: true },
        { id: "note", label: "Your question", type: "textarea", required: true }
      ];
    }
    return [
      { id: "name", label: "Your name", required: true },
      { id: "role", label: "Role / title", required: true },
      { id: "org", label: "Organization", required: true },
      { id: "note", label: "Anything we should know?", type: "textarea", required: false, placeholder: "Timeline, site type, open protocols…" }
    ];
  }

  function buildBody(kind, values) {
    var name = (values.name || "").trim();
    var role = (values.role || "").trim();
    var org = (values.org || "").trim();
    var note = (values.note || "").trim();

    if (kind === "founder") {
      return "Hi Anirudh,\n\n"
        + (note || "I wanted to get connected regarding Damaros.") + "\n\n"
        + (name ? ("Name: " + name + "\n") : "")
        + (org ? ("Organization: " + org + "\n") : "");
    }
    if (kind === "privacy") {
      return "Hi Damaros Team,\n\n"
        + note + "\n\n"
        + (name ? ("Name: " + name + "\n") : "");
    }
    return "Hi Damaros Team,\n\n"
      + "I'm interested in learning more about the platform and exploring a pilot.\n\n"
      + "Name: " + name + "\n"
      + "Role/Title: " + role + "\n"
      + "Organization: " + org + "\n"
      + (note ? ("\n" + note + "\n") : "");
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
      var empty = !(el.value || "").trim();
      var bad = f.required && empty;
      el.classList.toggle("dm-invalid", bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function openForm(parsed) {
    closeForm();
    ensureStyles();
    var meta = kindMeta(parsed.kind, parsed);
    var fields = fieldsFor(parsed.kind);

    var fieldHtml = fields.map(function (f) {
      var common = 'data-field="' + f.id + '" id="dm-f-' + f.id + '" class="'
        + (f.type === "textarea" ? "dm-form-textarea" : "dm-form-input") + '"'
        + (f.required ? " required" : "")
        + (f.placeholder ? ' placeholder="' + escapeHtml(f.placeholder) + '"' : "");
      var control = f.type === "textarea"
        ? "<textarea " + common + ">" + escapeHtml(f.value || "") + "</textarea>"
        : "<input type=\"text\" " + common + (f.value ? ' value="' + escapeHtml(f.value) + '"' : "") + " autocomplete=\"on\">";
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
      '  <form class="dm-form-fields" novalidate>' + fieldHtml,
      '    <p class="dm-form-hint">Opens your mail app with subject <strong style="color:#3c4955;font-weight:600;">'
        + escapeHtml(meta.subject) + "</strong>.</p>",
      '    <button type="submit" class="dm-form-submit">' + escapeHtml(meta.cta) + "</button>",
      "  </form>",
      '  <p class="dm-form-to">to ' + escapeHtml(meta.to) + "</p>",
      '  <button type="button" class="dm-form-cancel">Cancel</button>',
      "</div>"
    ].join("");

    function submit() {
      if (!validate(root, parsed.kind)) {
        var bad = root.querySelector(".dm-invalid");
        if (bad) bad.focus();
        return;
      }
      var body = buildBody(parsed.kind, collectValues(root));
      var href = mailtoUrl(meta.to, meta.subject, body);
      closeForm();
      window.location.href = href;
    }

    root.addEventListener("click", function (e) {
      if (e.target === root || e.target.classList.contains("dm-form-cancel")) {
        e.preventDefault();
        closeForm();
      }
    });

    root.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      submit();
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
    e.preventDefault();
    openMail(a.getAttribute("href"));
  }, true);

  window.dmOpenMail = openMail;
})();
