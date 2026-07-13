/**
 * GET /api/public-config
 * Public client config (Turnstile site key is designed to be public).
 */
module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }

  // Always-pass test key when unset — replace with production site key in Vercel.
  const turnstileSiteKey =
    process.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.end(JSON.stringify({ turnstileSiteKey }));
};
