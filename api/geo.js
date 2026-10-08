/**
 * GET /api/geo
 * The visitor's nearest city, read from the header Vercel's edge already attaches to every request
 * (derived from the IP address). Nothing is stored and no third party is called; the answer goes back only
 * to the visitor it describes. The privacy policy's "approximate city-level location" covers it.
 *
 * 200 { city } when Vercel knows the city; 204 when it does not (local dev, unknown IPs).
 */

module.exports = (req, res) => {
  let city = "";
  try {
    city = decodeURIComponent(req.headers["x-vercel-ip-city"] || "").trim();
  } catch {
    city = "";
  }
  res.setHeader("Cache-Control", "private, no-store");
  if (!city) {
    res.statusCode = 204;
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ city }));
};
