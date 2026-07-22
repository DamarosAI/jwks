/**
 * POST /api/pilot-inquiry
 * Accepts pilot form fields and emails team@damaros.ai via Resend.
 *
 * Env (Vercel + local .env.local):
 *   RESEND_API_KEY      required
 *   PILOT_FROM_EMAIL    default: Damaros <team@damaros.ai>
 *   PILOT_TO_EMAIL      default: team@damaros.ai
 */

const { Resend } = require("resend");
const { parsePilotInquiry, buildPilotEmail } = require("./lib/pilot-inquiry");

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function rateLimited(ip) {
  const now = Date.now();
  let bucket = hits.get(ip);
  if (!bucket || now - bucket.start > WINDOW_MS) {
    bucket = { start: now, count: 0 };
    hits.set(ip, bucket);
  }
  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return json(res, 429, { error: "Too many requests. Try again in a minute." });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: "Invalid JSON body." });
  }

  const parsed = parsePilotInquiry(body);
  if (!parsed.ok) {
    return json(res, parsed.status, { error: parsed.error });
  }

  // Silent success for honeypot so bots do not learn the trap.
  if (parsed.data.honeypot) {
    return json(res, 200, { ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("pilot-inquiry: RESEND_API_KEY is not set");
    return json(res, 500, { error: "Email service is not configured." });
  }

  // Always deliver pilot inquiries to the team inbox.
  const from = process.env.PILOT_FROM_EMAIL || "Damaros <team@damaros.ai>";
  const to = process.env.PILOT_TO_EMAIL || "team@damaros.ai";
  if (!String(to).toLowerCase().includes("damaros.ai")) {
    console.error("pilot-inquiry: refusing unexpected PILOT_TO_EMAIL", to);
    return json(res, 500, { error: "Email service is misconfigured." });
  }
  const { subject, text, html } = buildPilotEmail(parsed.data);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: parsed.data.email,
    subject,
    text,
    html,
    tags: [{ name: "category", value: "pilot_inquiry" }],
  });

  if (error) {
    console.error("pilot-inquiry: Resend error", error);
    return json(res, 502, { error: "Could not send message. Try again shortly." });
  }

  return json(res, 200, { ok: true, id: data && data.id });
};
