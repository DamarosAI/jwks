/**
 * POST /api/contact
 * Verifies Cloudflare Turnstile, then emails the team via Resend.
 *
 * Env (Vercel project settings):
 *   TURNSTILE_SECRET_KEY  — Cloudflare Turnstile secret
 *   RESEND_API_KEY        — Resend API key
 *   CONTACT_FROM          — verified sender, e.g. "Damaros <forms@damaros.ai>"
 *   CONTACT_TO_PILOT      — optional override (default team@damaros.ai)
 *   CONTACT_TO_FOUNDER    — optional override (default anirudh@damaros.ai)
 */
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";

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

async function verifyTurnstile(token, ip) {
  const secret =
    process.env.TURNSTILE_SECRET_KEY ||
    "1x0000000000000000000000000000000AA";
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token || "");
  if (ip) body.set("remoteip", ip);

  const r = await fetch(TURNSTILE_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return r.json();
}

function formatEmail({ kind, name, email, role, org, note }) {
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
  const turnstileToken = clean(payload.turnstileToken, 2048);

  if (!name) return json(res, 400, { ok: false, error: "Name is required" });
  if (!isEmail(email)) return json(res, 400, { ok: false, error: "Valid email is required" });
  if (kind === "pilot" && !role) {
    return json(res, 400, { ok: false, error: "Role / title is required" });
  }
  if (kind === "pilot" && !org) {
    return json(res, 400, { ok: false, error: "Organization is required" });
  }
  if ((kind === "founder" || kind === "privacy") && !note) {
    return json(res, 400, { ok: false, error: "Message is required" });
  }
  if (!turnstileToken) {
    return json(res, 400, { ok: false, error: "Complete the security check" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "";

  let verified;
  try {
    verified = await verifyTurnstile(turnstileToken, ip);
  } catch {
    return json(res, 502, { ok: false, error: "Security check failed" });
  }
  if (!verified || verified.success !== true) {
    return json(res, 403, { ok: false, error: "Security check failed" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return json(res, 503, {
      ok: false,
      error: "Form delivery is not configured yet",
    });
  }

  const toEnv =
    kind === "founder"
      ? process.env.CONTACT_TO_FOUNDER
      : kind === "privacy"
        ? process.env.CONTACT_TO_PRIVACY || process.env.CONTACT_TO_PILOT
        : process.env.CONTACT_TO_PILOT;
  const to = toEnv || DEFAULT_TO[kind];
  const from =
    process.env.CONTACT_FROM || "Damaros <onboarding@resend.dev>";
  const subject = SUBJECT[kind];
  const text = formatEmail({ kind, name, email, role, org, note });

  try {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("resend error", r.status, data);
      return json(res, 502, { ok: false, error: "Could not deliver message" });
    }
  } catch (err) {
    console.error("resend fetch failed", err);
    return json(res, 502, { ok: false, error: "Could not deliver message" });
  }

  return json(res, 200, { ok: true });
};
