/**
 * Shared pilot-inquiry validation and email body builders.
 * Used by the Vercel function and unit tests — no Resend I/O here.
 */

const MAX = {
  name: 120,
  role: 120,
  organization: 160,
  email: 254,
  message: 4000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimStr(v, max) {
  if (v == null) return "";
  return String(v).trim().slice(0, max);
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {{ ok: true, data: object } | { ok: false, status: number, error: string }}
 */
function parsePilotInquiry(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, status: 400, error: "Invalid request body." };
  }

  // Honeypot — bots fill hidden "website"; humans never see it.
  if (trimStr(raw.website, 200)) {
    return { ok: true, data: { honeypot: true } };
  }

  const name = trimStr(raw.name, MAX.name);
  const role = trimStr(raw.role, MAX.role);
  const organization = trimStr(raw.organization, MAX.organization);
  const email = trimStr(raw.email, MAX.email).toLowerCase();
  const message = trimStr(raw.message, MAX.message);

  if (!name) return { ok: false, status: 400, error: "Name is required." };
  if (!role) return { ok: false, status: 400, error: "Role is required." };
  if (!organization) return { ok: false, status: 400, error: "Organization is required." };
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, status: 400, error: "A valid work email is required." };
  }
  if (!message) {
    return { ok: false, status: 400, error: "Tell us what you're working on." };
  }

  return {
    ok: true,
    data: { name, role, organization, email, message, honeypot: false },
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPilotEmail(data) {
  const subject = `Pilot inquiry — ${data.organization} (${data.name})`;
  const lines = [
    "New pilot inquiry from damaros.ai",
    "",
    `Name: ${data.name}`,
    `Role: ${data.role}`,
    `Organization: ${data.organization}`,
    `Email: ${data.email}`,
    "",
    "What they're working on:",
    data.message,
  ];
  const text = lines.join("\n");

  const msgHtml =
    `<p style="margin:16px 0 0;"><strong>What they're working on</strong></p>` +
    `<p style="margin:6px 0 0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>`;

  const html = [
    '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#10161d;">',
    "<p><strong>New pilot inquiry from damaros.ai</strong></p>",
    "<table style=\"border-collapse:collapse;\">",
    row("Name", data.name),
    row("Role", data.role),
    row("Organization", data.organization),
    row("Email", data.email),
    "</table>",
    msgHtml,
    "</div>",
  ].join("");

  return { subject, text, html };
}

function row(label, value) {
  return (
    "<tr>" +
    `<td style="padding:4px 16px 4px 0;color:#586674;vertical-align:top;">${escapeHtml(label)}</td>` +
    `<td style="padding:4px 0;font-weight:600;">${escapeHtml(value)}</td>` +
    "</tr>"
  );
}

module.exports = {
  MAX,
  parsePilotInquiry,
  buildPilotEmail,
  escapeHtml,
};
