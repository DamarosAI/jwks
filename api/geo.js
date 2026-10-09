/**
 * GET /api/geo
 * Where the visitor roughly is, read from the headers Vercel's edge already attaches to every request
 * (derived from the IP address). Nothing is stored and no third party is called; the answer goes back only
 * to the visitor it describes. The privacy policy's "approximate city-level location" covers it.
 *
 * The label reads "City, ST" in the United States and "City, Country" everywhere else, falling back to
 * whatever part is known. 200 { label, city, region, country } when anything is known; 204 when nothing is.
 */

const COUNTRY_NAMES = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

function header(req, name) {
  const raw = req.headers[name];
  if (typeof raw !== "string" || !raw) return "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return "";
  }
}

function countryName(code) {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  try {
    return (COUNTRY_NAMES && COUNTRY_NAMES.of(code)) || code;
  } catch {
    return code;
  }
}

function label({ city, region, country }) {
  if (country === "US") {
    const state = /^[A-Z]{2}$/.test(region) ? region : "";
    if (city && state) return `${city}, ${state}`;
    if (city) return `${city}, USA`;
    if (state) return `${state}, USA`;
    return "United States";
  }
  const name = countryName(country);
  if (city && name) return `${city}, ${name}`;
  return city || name;
}

module.exports = (req, res) => {
  const place = {
    city: header(req, "x-vercel-ip-city"),
    region: header(req, "x-vercel-ip-country-region").toUpperCase(),
    country: header(req, "x-vercel-ip-country").toUpperCase(),
  };
  const text = label(place);
  res.setHeader("Cache-Control", "private, no-store");
  if (!text) {
    res.statusCode = 204;
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ label: text, ...place }));
};
