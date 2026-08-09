/**
 * Smoke checks for the shared float-nav mobile pattern.
 * Ensures every marketing page wires the shared CSS/JS and keeps brand + menu
 * controls instead of the old absolute-centered tabs that overflowed phones.
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PAGES = ["index.html", "platform.html", "about.html", "privacy.html"];

describe("float-nav mobile wiring", () => {
  it("ships shared float-nav assets", () => {
    assert.ok(fs.existsSync(path.join(ROOT, "float-nav.css")));
    assert.ok(fs.existsSync(path.join(ROOT, "float-nav.js")));
    const css = fs.readFileSync(path.join(ROOT, "float-nav.css"), "utf8");
    assert.match(css, /@media \(max-width:720px\)/);
    assert.match(css, /\.dm-float-nav__menu\{/);
    assert.match(css, /\.dm-float-nav__brand\{\s*display:inline-flex !important;/);
    assert.doesNotMatch(css, /display:none;\s*\}\s*\.dm-float-nav__tabs a\{padding:6px 9px/);
  });

  for (const page of PAGES) {
    it(`${page} uses shared nav + mobile menu markup`, () => {
      const html = fs.readFileSync(path.join(ROOT, page), "utf8");
      assert.match(html, /href="\.\/float-nav\.css\?v=\d+"/);
      assert.match(html, /src="\.\/float-nav\.js\?v=\d+"/);
      assert.match(html, /class="dm-float-nav__brand"/);
      assert.match(html, /class="dm-float-nav__menu"/);
      assert.match(html, /class="dm-float-nav__cta-short"/);
      assert.match(html, /id="dm-float-nav-tabs"/);
      assert.doesNotMatch(html, /@media \(max-width:420px\)\{\s*\.dm-float-nav__brand\{display:none;\}/);
      // No orphaned rules left after extracting inline nav CSS.
      assert.doesNotMatch(html, /\.dm-float-nav__tabs a\{padding:6px 9px;font-size:11\.5px;\}/);
    });
  }
});
