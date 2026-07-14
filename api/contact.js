/**
 * POST /api/contact
 *
 * Contact delivery is now client-side native mailto (see mail-cta.js).
 * Kept as a no-op so older clients get a clear response instead of hanging
 * on dead FormSubmit / Resend paths.
 */
function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
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

  return json(res, 200, {
    ok: true,
    deliver: "mailto",
    message: "Use the on-site form; delivery is via the visitor's mail app.",
  });
};
