/**
 * POST /api/contact
 * Applies quiet anti-spam controls, then emails the team via Resend.
 *
 * Env (Vercel project settings):
 *   RESEND_API_KEY        — Resend API key
 *   CONTACT_FROM          — verified sender, e.g. "Damaros <forms@damaros.ai>"
 *   CONTACT_TO_PILOT      — optional override (default team@damaros.ai)
 *   CONTACT_TO_FOUNDER    — optional override (default anirudh@damaros.ai)
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
  if (kind === "pilot" && !org) {
    return json(res, 400, { ok: false, error: "Organization is required" });
  }
  if ((kind === "founder" || kind === "privacy") && !note) {
    return json(res, 400, { ok: false, error: "Message is required" });
  }
  if (wordCount(note) > 100) {
    return json(res, 400, { ok: false, error: "Messages are limited to 100 words" });
  }
  if (!Number.isFinite(openedAt) || Date.now() - openedAt < MIN_FORM_FILL_MS) {
    return json(res, 429, { ok: false, error: "Please take a moment before sending" });
  }
  if (isRateLimited(ip)) {
    return json(res, 429, { ok: false, error: "Please wait a minute before sending another message" });
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
    recentSubmissions.set(ip, Date.now());
  } catch (err) {
    console.error("resend fetch failed", err);
    return json(res, 502, { ok: false, error: "Could not deliver message" });
  }

  return json(res, 200, { ok: true });
};
