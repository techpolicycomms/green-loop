/**
 * Email sender for LémanLoop.
 * Uses Resend API (https://resend.com) when RESEND_API_KEY is set.
 * Falls back to no-op with a warning when not configured.
 * Logs all sends to the notifications table via the Supabase service role.
 */

import {
  welcomeVolunteer,
  welcomeOrganizer,
  eventCreated,
  checkInConfirmed,
  roleChanged,
  eventReminder,
  depositReminder,
  type NotificationVars,
  type Template
} from "./emailTemplates";

const RESEND_API = "https://api.resend.com/emails";
const FROM = process.env.RESEND_FROM_EMAIL || "LémanLoop <noreply@lemanloop.ch>";

// ── Core send ─────────────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  { subject, html }: Template
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info(`[mailer] RESEND_API_KEY not set — skipping email to ${to} (${subject})`);
    return { ok: false, error: "no_api_key" };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from: FROM, to, subject, html })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[mailer] send failed to ${to}:`, err);
      return { ok: false, error: err };
    }

    const json = await res.json().catch(() => ({}));
    return { ok: true, id: (json as { id?: string }).id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[mailer] network error sending to ${to}:`, msg);
    return { ok: false, error: msg };
  }
}

// ── Notification logger ───────────────────────────────────────────────────

async function logNotification(opts: {
  user_id?: string;
  type: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  error_message?: string;
  metadata?: Record<string, unknown>;
}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) return;

  try {
    await fetch(`${url}/rest/v1/notifications`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        user_id: opts.user_id ?? null,
        type: opts.type,
        subject: opts.subject,
        status: opts.status,
        error_message: opts.error_message ?? null,
        metadata: opts.metadata ?? null,
        sent_at: opts.status === "sent" ? new Date().toISOString() : null
      })
    });
  } catch {
    // logging is best-effort
  }
}

// ── Named senders ─────────────────────────────────────────────────────────

type SendResult = { ok: boolean; error?: string };

async function deliver(
  to: string,
  userId: string | undefined,
  type: string,
  tpl: Template,
  meta?: Record<string, unknown>
): Promise<SendResult> {
  const result = await sendEmail(to, tpl);
  await logNotification({
    user_id: userId,
    type,
    subject: tpl.subject,
    status: result.ok ? "sent" : result.error === "no_api_key" ? "skipped" : "failed",
    error_message: result.error,
    metadata: meta
  });
  return result;
}

export async function sendWelcomeVolunteer(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "welcome_volunteer", welcomeVolunteer(vars), { role: "volunteer" });
}

export async function sendWelcomeOrganizer(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "welcome_organizer", welcomeOrganizer(vars), { role: "organizer" });
}

export async function sendEventCreated(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "event_created", eventCreated(vars), { event_name: vars.event_name });
}

export async function sendCheckInConfirmed(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "check_in_confirmed", checkInConfirmed(vars), {
    event_name: vars.event_name,
    lat: vars.lat,
    lng: vars.lng
  });
}

export async function sendRoleChanged(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "role_changed", roleChanged(vars), { new_role: vars.new_role });
}

export async function sendEventReminder(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "event_reminder", eventReminder(vars), { event_name: vars.event_name });
}

export async function sendDepositReminder(
  to: string, userId: string | undefined, vars: NotificationVars
): Promise<SendResult> {
  return deliver(to, userId, "deposit_reminder", depositReminder(vars), {
    event_name: vars.event_name,
    deposit_total: vars.deposit_total
  });
}
