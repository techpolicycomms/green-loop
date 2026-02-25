/**
 * HTML email templates for LémanLoop notifications.
 * Call template(vars) to get a { subject, html } object.
 */

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const BRAND = {
  primary: "#15803d",
  primaryDark: "#166534",
  volunteer: "#dcfce7",
  organizer: "#dbeafe",
  admin: "#fee2e2",
  bg: "#f9fafb",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lemanloop.ch"
};

function wrap(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>LémanLoop</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND.text};">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td style="background:${BRAND.primary};border-radius:12px 12px 0 0;padding:24px 32px;">
    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">🌿 LémanLoop</span>
    <span style="color:#bbf7d0;font-size:13px;margin-left:12px;">Circular lanyards · Geneva</span>
  </td></tr>
  <!-- Body -->
  <tr><td style="background:${BRAND.surface};padding:36px 32px;border:1px solid ${BRAND.border};border-top:none;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:${BRAND.bg};border-radius:0 0 12px 12px;padding:20px 32px;border:1px solid ${BRAND.border};border-top:none;">
    <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.6;">
      LémanLoop · Geneva, Switzerland<br/>
      Reducing lanyard waste at conferences and events.<br/>
      <a href="${BRAND.url}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.url}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(text: string, href: string, color = BRAND.primary) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">${text} →</a>`;
}

function heading(text: string) {
  return `<h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND.text};line-height:1.3;">${text}</h2>`;
}

function para(text: string) {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${BRAND.text};">${text}</p>`;
}

function list(items: string[]) {
  return `<ul style="margin:0 0 14px;padding-left:20px;">${items.map(i => `<li style="font-size:15px;line-height:1.7;margin-bottom:6px;">${i}</li>`).join("")}</ul>`;
}

function badge(text: string, bg: string, color: string) {
  return `<span style="display:inline-block;background:${bg};color:${color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`;
}

// ─────────────────────────────────────────────────────────────────────────────

export type NotificationVars = {
  display_name?: string;
  email?: string;
  role?: string;
  event_name?: string;
  event_location?: string;
  event_date?: string;
  expected_lanyards?: number;
  deposit_total?: number;
  lat?: number;
  lng?: number;
  new_role?: string;
  reminder_message?: string;
  cert_url?: string;
};

export type Template = { subject: string; html: string };

// ── Welcome Volunteer ─────────────────────────────────────────────────────

export function welcomeVolunteer(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  return {
    subject: "Welcome to LémanLoop — your volunteer dashboard is ready 🌿",
    html: wrap(`
      ${heading(`Welcome aboard, ${name}!`)}
      ${para("You've joined LémanLoop as a <strong>volunteer</strong> — thank you for helping keep lanyards out of landfill.")}
      ${badge("Volunteer", BRAND.volunteer, BRAND.primaryDark)}
      <br/><br/>
      ${para("<strong>Here's what you do:</strong>")}
      ${list([
        "Show up at registered Geneva events with a collection bag",
        "Grade lanyards A (perfect), B (usable), or C (needs recycling)",
        "GPS check-in to confirm your location",
        "Photograph each batch for verification",
        "Earn karma points — 10 pts per lanyard collected"
      ])}
      ${para("<strong>Karma rewards:</strong>")}
      ${list([
        "100 pts → free community event ticket",
        "500 pts → Geneva tram day-pass",
        "1,000 pts → partner NGO membership"
      ])}
      ${btn("Open volunteer dashboard", `${BRAND.url}/volunteer`)}
    `)
  };
}

// ── Welcome Organizer ─────────────────────────────────────────────────────

export function welcomeOrganizer(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  return {
    subject: "Welcome to LémanLoop — register your first event 🗂️",
    html: wrap(`
      ${heading(`Welcome, ${name}!`)}
      ${para("You're now registered as an <strong>event organiser</strong> on LémanLoop.")}
      ${badge("Organizer", BRAND.organizer, "#1d4ed8")}
      <br/><br/>
      ${para("<strong>How it works:</strong>")}
      ${list([
        "Register your event and expected lanyard count",
        "Pay a refundable CHF 2 deposit per lanyard",
        "Volunteers collect, grade, and document lanyards during your event",
        "Grade A/B: full CHF 2 refund per lanyard (to the reuse library)",
        "Grade C: CHF 1 partial refund (lanyard goes to upcycling/recycling)",
        "Receive a verified circular impact certificate post-event"
      ])}
      ${para("Your first event registration takes under 2 minutes.")}
      ${btn("Register an event", `${BRAND.url}/organizer`, "#1d4ed8")}
    `)
  };
}

// ── Event Registered ──────────────────────────────────────────────────────

export function eventCreated(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  const lanyards = v.expected_lanyards ?? 0;
  const deposit = v.deposit_total ?? lanyards * 2;
  const co2 = ((lanyards * 25) / 1000).toFixed(1);
  return {
    subject: `Event registered: ${v.event_name || "your event"} — LémanLoop`,
    html: wrap(`
      ${heading("Event registered ✓")}
      ${para(`Hi ${name}, your event has been registered on LémanLoop.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:20px;margin:16px 0;border:1px solid ${BRAND.border};">
        <tr><td style="font-size:14px;color:${BRAND.muted};padding-bottom:6px;">Event</td><td style="font-weight:600;">${esc(v.event_name) || "—"}</td></tr>
        <tr><td style="font-size:14px;color:${BRAND.muted};padding-bottom:6px;">Venue</td><td>${esc(v.event_location) || "—"}</td></tr>
        <tr><td style="font-size:14px;color:${BRAND.muted};padding-bottom:6px;">Expected lanyards</td><td>${lanyards}</td></tr>
        <tr><td style="font-size:14px;color:${BRAND.muted};padding-bottom:6px;">Refundable deposit</td><td><strong>CHF ${deposit}</strong></td></tr>
        <tr><td style="font-size:14px;color:${BRAND.muted};">Estimated CO₂ diverted</td><td><strong>≈ ${co2} kg</strong></td></tr>
      </table>
      ${para("Volunteers will see your event on the platform and can begin collecting once you confirm the deposit.")}
      ${para("<strong>Next step:</strong> confirm your deposit payment to activate volunteer collection.")}
      ${btn("Manage your event", `${BRAND.url}/organizer`)}
    `)
  };
}

// ── Check-in Confirmed ────────────────────────────────────────────────────

export function checkInConfirmed(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  return {
    subject: "Check-in confirmed — thanks for collecting! 🌿",
    html: wrap(`
      ${heading("Check-in confirmed ✓")}
      ${para(`Great work, ${name}! Your GPS check-in has been recorded.`)}
      ${v.event_name ? para(`<strong>Event:</strong> ${esc(v.event_name)}`) : ""}
      ${v.lat && v.lng ? para(`<strong>Location:</strong> ${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}`) : ""}
      <br/>
      ${para("<strong>Don't forget to complete your collection:</strong>")}
      ${list([
        "Grade each batch of lanyards (A, B, or C)",
        "Photograph the sorted batches",
        "Upload your photos in the volunteer dashboard"
      ])}
      ${para("Each documented lanyard earns you <strong>10 karma points</strong>.")}
      ${btn("Complete my collection", `${BRAND.url}/volunteer`)}
    `)
  };
}

// ── Role Changed ──────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, { label: string; desc: string; bg: string; color: string }> = {
  volunteer: {
    label: "Volunteer",
    desc: "Collect and grade lanyards at Geneva events. Earn karma points.",
    bg: BRAND.volunteer,
    color: BRAND.primaryDark
  },
  organizer: {
    label: "Event Organizer",
    desc: "Register events, manage deposits, and receive impact certificates.",
    bg: BRAND.organizer,
    color: "#1d4ed8"
  },
  admin: {
    label: "Administrator",
    desc: "Full platform access — manage users, events, and platform settings.",
    bg: BRAND.admin,
    color: "#b91c1c"
  }
};

export function roleChanged(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  const newRole = v.new_role ?? "volunteer";
  const info = ROLE_LABELS[newRole] ?? ROLE_LABELS.volunteer;
  const dashPaths: Record<string, string> = { admin: "/admin", organizer: "/organizer", volunteer: "/volunteer" };
  return {
    subject: `Your LémanLoop role has been updated to ${info.label}`,
    html: wrap(`
      ${heading("Your role has been updated")}
      ${para(`Hi ${name}, an administrator has updated your LémanLoop role.`)}
      <div style="background:${info.bg};border-radius:8px;padding:20px;margin:16px 0;">
        <div style="font-weight:700;font-size:18px;color:${info.color};margin-bottom:6px;">${info.label}</div>
        <div style="font-size:14px;color:${BRAND.text};">${info.desc}</div>
      </div>
      ${para("Your dashboard has been updated to reflect your new role and permissions.")}
      ${btn(`Go to ${info.label} dashboard`, `${BRAND.url}${dashPaths[newRole]}`, info.color)}
    `)
  };
}

// ── Event Reminder ────────────────────────────────────────────────────────

export function eventReminder(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  return {
    subject: `Reminder: ${v.event_name || "your event"} is coming up — LémanLoop`,
    html: wrap(`
      ${heading("Event reminder 📅")}
      ${para(`Hi ${name}, a reminder about your upcoming event on LémanLoop.`)}
      ${v.event_name ? `<div style="font-size:20px;font-weight:700;color:${BRAND.primary};margin:16px 0;">${esc(v.event_name)}</div>` : ""}
      ${v.event_location ? para(`<strong>Venue:</strong> ${esc(v.event_location)}`) : ""}
      ${v.reminder_message ? `<div style="background:#f9fafb;border-left:3px solid ${BRAND.primary};padding:16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:14px;">${esc(v.reminder_message)}</div>` : ""}
      ${para("Make sure volunteers know your collection points before the event.")}
      ${btn("View event details", `${BRAND.url}/organizer`)}
    `)
  };
}

// ── Deposit Reminder ──────────────────────────────────────────────────────

export function depositReminder(v: NotificationVars): Template {
  const name = esc(v.display_name || v.email?.split("@")[0] || "there");
  const lanyards = v.expected_lanyards ?? 0;
  const deposit = v.deposit_total ?? lanyards * 2;
  return {
    subject: `Deposit reminder for ${v.event_name || "your event"} — LémanLoop`,
    html: wrap(`
      ${heading("Deposit reminder 💳")}
      ${para(`Hi ${name}, your event deposit is still pending.`)}
      ${v.event_name ? para(`<strong>Event:</strong> ${esc(v.event_name)}`) : ""}
      ${lanyards ? para(`<strong>Deposit due:</strong> CHF ${deposit} (CHF 2 × ${lanyards} lanyards)`) : ""}
      ${para("Volunteers won't be activated until your deposit is confirmed. Pay now to ensure maximum lanyard collection at your event.")}
      ${para("The deposit is <strong>fully refundable</strong> for Grade A/B lanyards returned to the circular library.")}
      ${btn("Pay deposit & activate volunteers", `${BRAND.url}/organizer`)}
    `)
  };
}
