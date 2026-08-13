/**
 * Phrase breaks for section titles. The thesis line must not wrap after
 * a hanging preposition ("cannot run on" / "the last generation...").
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { balancedBreak, isHangingBreak } = require("./section-title-fit.js");

const THESIS =
  "The next generation of medicine cannot run on the last generation of research infrastructure.";

describe("section-title phrase breaks", () => {
  it("treats a wrap after 'on' as a hanging mid-sentence break", () => {
    assert.equal(
      isHangingBreak(
        "The next generation of medicine cannot run on",
        "the last generation of research infrastructure."
      ),
      true
    );
  });

  it("allows the subject / predicate break after 'medicine'", () => {
    assert.equal(
      isHangingBreak(
        "The next generation of medicine",
        "cannot run on the last generation of research infrastructure."
      ),
      false
    );
  });

  it("does not auto-split the thesis line after a hanging 'on'", () => {
    const br = balancedBreak(THESIS, "");
    assert.ok(br);
    assert.notEqual(br.left, "The next generation of medicine cannot run on");
    assert.equal(isHangingBreak(br.left, br.right), false);
  });

  it("keeps an author <br> after medicine and drops the 28ch wrap", () => {
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
    assert.match(
      html,
      /<h2 class="dm-section-title">The next generation of medicine<br>cannot run on&nbsp;the last generation of research infrastructure\.<\/h2>/
    );
    assert.doesNotMatch(html, /max-width:28ch/);
    assert.doesNotMatch(
      html,
      /#thesis \.dm-section-title\{max-width:36ch !important;[^}]*text-wrap:balance/
    );
  });
});
