/**
 * Thesis headline stays one sentence. No mid-line wrap after "on".
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { isHangingBreak } = require("./section-title-fit.js");

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

  it("keeps the thesis headline as one line with no <br>", () => {
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
    assert.match(
      html,
      /<h2 class="dm-section-title">The next generation of medicine cannot run on the last generation of research infrastructure\.<\/h2>/
    );
    assert.doesNotMatch(
      html,
      /The next generation of medicine<br/
    );
  });
});
