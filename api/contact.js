/**
 * POST /api/contact
 * Quiet anti-spam, then delivers inquiry email.
 *
 * Delivery (first match wins):
 *   1. Resend — when RESEND_API_KEY is set (branded From, best for production)
 *   2. FormSubmit — zero-config email to CONTACT_TO_* / defaults
 *
 * Env (optional on Vercel):
 *   RESEND_API_KEY        — Resend API key
 *   CONTACT_FROM          — verified sender, e.g. "Damaros <forms@damaros.ai>"
 *   CONTACT_TO_PILOT      — default team@damaros.ai
 *   CONTACT_TO_FOUNDER    — default anirudh@damaros.ai
 *   CONTACT_TO_PRIVACY    — default team@damaros.ai
 */
const RESEND_URL = "https://api.resend.com/emails";
const MIN_FORM_FILL_MS = 3000;
const COOLDOWN_MS = 60 * 1000;
const recentSubmissions = new Map();

const DEFAULT_TO = {
  pilot: "team@damaros.ai",
  founder: "anirudh@damaros.ai",
  privacy: "team@damaros.ai",
};

const SUBJECT = {
  pilot: "Damaros Pilot Inquiry",
  founder: "Damaros Founder Inquiry",
  privacy: "Privacy policy question",
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function clean(s, max) {
  return String(s || "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, max || 2000);
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function wordCount(value) {
  const text = clean(value, 4000);
  return text ? text.split(/\s+/).length : 0;
}

function isRateLimited(ip) {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions) {
    if (now - timestamp > COOLDOWN_MS) recentSubmissions.delete(key);
  }
  const lastSubmission = recentSubmissions.get(ip);
  return Boolean(lastSubmission && now - lastSubmission < COOLDOWN_MS);
}

function resolveTo(kind) {
  const toEnv =
    kind === "founder"
      ? process.env.CONTACT_TO_FOUNDER
      : kind === "privacy"
        ? process.env.CONTACT_TO_PRIVACY || process.env.CONTACT_TO_PILOT
        : process.env.CONTACT_TO_PILOT;
  return clean(toEnv || DEFAULT_TO[kind], 200).toLowerCase();
}

function formatText({ kind, name, email, role, org, note }) {
  const lines = [
    `Kind: ${kind}`,
    `Name: ${name}`,
    `Email: ${email}`,
  ];
  if (role) lines.push(`Role/Title: ${role}`);
  if (org) lines.push(`Organization: ${org}`);
  lines.push("", note || "(no message)");
  return lines.join("\n");
}

async function deliverViaResend({ to, from, subject, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };

  const r = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("resend error", r.status, data);
    return { ok: false, error: "Could not deliver message via Resend" };
  }
  return { ok: true, provider: "resend" };
}

async function deliverViaFormSubmit({
  to,
  subject,
  name,
  email,
  role,
  org,
  note,
  kind,
  origin,
}) {
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(to)}`;
  const site = origin || "https://www.damaros.ai";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let r;
  try {
    r = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: site,
        Referer: site.endsWith("/") ? site : site + "/",
      },
      body: JSON.stringify({
        name,
        email,
        role: role || "",
        organization: org || "",
        kind,
        message: note,
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: email,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  const data = await r.json().catch(() => ({}));
  const success =
    r.ok &&
    (data.success === true ||
      data.success === "true" ||
      /thank|success|submitted/i.test(String(data.message || "")));

  if (!success) {
    const needsActivation = /activat/i.test(String(data.message || ""));
    console.error("formsubmit error", r.status, data);
    return {
      ok: false,
      needsActivation,
      error: needsActivation
        ? `Check ${to} for a FormSubmit activation link, then submit again`
        : "Could not deliver message",
    };
  }
  return { ok: true, provider: "formsubmit" };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  let payload;
  try {
    payload = await readBody(req);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON" });
  }

  // Honeypot — bots that fill this are dropped silently.
  if (clean(payload.company_url, 200)) {
    return json(res, 200, { ok: true });
  }

  const kind = ["pilot", "founder", "privacy"].includes(payload.kind)
    ? payload.kind
    : "pilot";
  const name = clean(payload.name, 120);
  const email = clean(payload.email, 200).toLowerCase();
  const role = clean(payload.role, 160);
  const org = clean(payload.org, 160);
  const note = clean(payload.note, 4000);
  const openedAt = Number(payload.openedAt);
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!name) return json(res, 400, { ok: false, error: "Name is required" });
  if (!isEmail(email)) return json(res, 400, { ok: false, error: "Valid email is required" });
  if (kind === "pilot" && !role) {
    return json(res, 400, { ok: false, error: "Role / title is required" });
  }
  if ((kind === "pilot" || kind === "founder") && !org) {
    return json(res, 400, { ok: false, error: "Organization is required" });
  }
  if (!note) {
    return json(res, 400, { ok: false, error: "Context is required" });
  }
  if (wordCount(note) > 100) {
    return json(res, 400, { ok: false, error: "Messages are limited to 100 words" });
  }
  if (!Number.isFinite(openedAt) || Date.now() - openedAt < MIN_FORM_FILL_MS) {
    return json(res, 429, { ok: false, error: "Please take a moment before sending" });
  }
  if (isRateLimited(ip)) {
    return json(res, 429, {
      ok: false,
      error: "Please wait a minute before sending another message",
    });
  }

  const to = resolveTo(kind);
  if (!isEmail(to)) {
    return json(res, 503, { ok: false, error: "Inbox address is not configured" });
  }

  const subject = SUBJECT[kind];
  const text = formatText({ kind, name, email, role, org, note });
  const from =
    process.env.CONTACT_FROM || "Damaros <onboarding@resend.dev>";
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "www.damaros.ai")
    .split(",")[0]
    .trim();
  const origin = `${proto}://${host}`;

  try {
    const resend = await deliverViaResend({
      to,
      from,
      subject,
      text,
      replyTo: email,
    });
    if (resend.ok) {
      recentSubmissions.set(ip, Date.now());
      console.log("contact delivered", { provider: "resend", kind, to });
      return json(res, 200, { ok: true });
    }
    if (!resend.skipped) {
      // Prefer FormSubmit as recovery path when Resend misconfigured.
      console.error("resend failed; trying formsubmit", resend.error);
    }

    const formSubmit = await deliverViaFormSubmit({
      to,
      subject,
      name,
      email,
      role,
      org,
      note,
      kind,
      origin,
    });
    if (!formSubmit.ok) {
      return json(res, formSubmit.needsActivation ? 503 : 502, {
        ok: false,
        error: formSubmit.error || "Could not deliver message",
      });
    }

    recentSubmissions.set(ip, Date.now());
    console.log("contact delivered", { provider: "formsubmit", kind, to });
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error("contact delivery failed", err);
    return json(res, 502, { ok: false, error: "Could not deliver message" });
  }
};
