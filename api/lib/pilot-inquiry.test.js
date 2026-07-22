const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { parsePilotInquiry, buildPilotEmail } = require("./pilot-inquiry");

describe("parsePilotInquiry", () => {
  it("accepts a valid payload", () => {
    const r = parsePilotInquiry({
      name: " Jane Smith ",
      role: "VP Clinical Ops",
      organization: "Meridian Oncology",
      email: "Jane@Meridian.example",
      message: "Ready for a pilot.",
    });
    assert.equal(r.ok, true);
    assert.equal(r.data.honeypot, false);
    assert.equal(r.data.name, "Jane Smith");
    assert.equal(r.data.email, "jane@meridian.example");
    assert.equal(r.data.message, "Ready for a pilot.");
  });

  it("requires name, role, organization, email", () => {
    assert.equal(parsePilotInquiry({ role: "a", organization: "b", email: "a@b.co" }).ok, false);
    assert.equal(parsePilotInquiry({ name: "a", organization: "b", email: "a@b.co" }).ok, false);
    assert.equal(parsePilotInquiry({ name: "a", role: "b", email: "a@b.co" }).ok, false);
    assert.equal(parsePilotInquiry({ name: "a", role: "b", organization: "c", email: "nope" }).ok, false);
  });

  it("treats filled honeypot as silent success", () => {
    const r = parsePilotInquiry({
      name: "Bot",
      role: "Bot",
      organization: "Bot Co",
      email: "bot@example.com",
      website: "https://spam.example",
    });
    assert.equal(r.ok, true);
    assert.equal(r.data.honeypot, true);
  });

  it("rejects non-objects", () => {
    assert.equal(parsePilotInquiry(null).ok, false);
    assert.equal(parsePilotInquiry("x").ok, false);
  });
});

describe("buildPilotEmail", () => {
  it("builds subject and includes fields", () => {
    const { subject, text, html } = buildPilotEmail({
      name: "Jane",
      role: "VP",
      organization: "Meridian",
      email: "jane@meridian.example",
      message: "Hello <script>",
    });
    assert.match(subject, /Meridian/);
    assert.match(text, /jane@meridian\.example/);
    assert.match(html, /Hello &lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/);
  });
});
