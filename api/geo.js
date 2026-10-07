/**
 * GET /api/geo
 * The visitor's approximate, city-level coordinates, read from the headers Vercel's edge already attaches
 * to every request (derived from the IP address). Nothing is stored and no third party is called; the
 * answer goes back only to the visitor it describes. The privacy policy's "approximate city-level location"
 * covers it.
 *
 * 200 { lat, lon } when Vercel knows the location; 204 when it does not (local dev, unknown IPs).
 */

module.exports = (req, res) => {
  const lat = Number.parseFloat(req.headers["x-vercel-ip-latitude"]);
  const lon = Number.parseFloat(req.headers["x-vercel-ip-longitude"]);
  res.setHeader("Cache-Control", "private, no-store");
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.statusCode = 204;
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ lat, lon }));
};
