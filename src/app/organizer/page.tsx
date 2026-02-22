"use client";

import { useEffect, useState } from "react";
import { IconCalendar, IconMapPin } from "@/components/Icons";

type Event = {
  id: string;
  name: string;
  location: string;
  created_at: string;
  created_by?: string;
};

type VolunteerProfile = {
  id: string;
  email?: string;
  display_name?: string;
  phone?: string;
  city?: string;
  availability?: string;
  motivation?: string;
};

type Application = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  message?: string;
  organizer_reply?: string;
  organizer_notes?: string;
  created_at: string;
  updated_at: string;
  volunteer?: VolunteerProfile;
};

const GENEVA_VENUES = [
  "Palexpo, Geneva",
  "CICG — Centre International de Conférences Genève",
  "Maison de la Paix, Geneva",
  "SwissTech Convention Center, EPFL",
  "Hôtel des Bergues, Geneva",
  "Bâtiment des Forces Motrices, Geneva",
  "Geneva Arena",
  "Uni Dufour, University of Geneva",
  "Villa Moynier, ICRC",
  "Other Geneva venue"
];

const DEPOSIT_PER_LANYARD_CHF = 2;
const CO2_PER_LANYARD_G = 25;

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
  withdrawn: "#6b7280"
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn"
};

export default function OrganizerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState("Pilot Event");
  const [location, setLocation] = useState("Palexpo, Geneva");
  const [customLocation, setCustomLocation] = useState("");
  const [expectedLanyards, setExpectedLanyards] = useState<number>(100);
  const [createStatus, setCreateStatus] = useState("");

  // Volunteer management
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appActionStatus, setAppActionStatus] = useState<Record<string, string>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const effectiveLocation = location === "Other Geneva venue" ? customLocation : location;
  const depositTotal = expectedLanyards * DEPOSIT_PER_LANYARD_CHF;
  const estimatedCO2 = Math.round((expectedLanyards * CO2_PER_LANYARD_G) / 1000 * 10) / 10;

  const load = async () => {
    try {
      const res = await fetch("/api/events", { credentials: "include" });
      if (!res.ok) { setEvents([]); return; }
      const data = await res.json().catch(() => []);
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    }
  };

  const loadApplications = async (eventId: string) => {
    setLoadingApps(true);
    setApplications([]);
    try {
      const res = await fetch(`/api/events/${eventId}/applications`, { credentials: "include" });
      if (!res.ok) { setLoadingApps(false); return; }
      const data = await res.json().catch(() => []);
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
    }
    setLoadingApps(false);
  };

  const selectEvent = (eventId: string) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
      setApplications([]);
    } else {
      setSelectedEventId(eventId);
      loadApplications(eventId);
    }
  };

  const updateApplication = async (
    appId: string,
    status: string,
    reply?: string,
    notes?: string
  ) => {
    setAppActionStatus((prev) => ({ ...prev, [appId]: "saving" }));
    try {
      const body: Record<string, unknown> = { status };
      if (reply !== undefined) body.organizer_reply = reply;
      if (notes !== undefined) body.organizer_notes = notes;

      const res = await fetch(`/api/events/applications/${appId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setAppActionStatus((prev) => ({ ...prev, [appId]: "saved" }));
        // Refresh applications list
        if (selectedEventId) await loadApplications(selectedEventId);
        setTimeout(() => setAppActionStatus((prev) => {
          const next = { ...prev };
          delete next[appId];
          return next;
        }), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setAppActionStatus((prev) => ({
          ...prev,
          [appId]: `Error: ${(data as { error?: string }).error || "Failed"}`
        }));
      }
    } catch {
      setAppActionStatus((prev) => ({ ...prev, [appId]: "Error: Network error" }));
    }
  };

  const createEvent = async () => {
    setCreateStatus("");
    if (location === "Other Geneva venue" && !customLocation.trim()) {
      setCreateStatus("Please enter a venue name for the custom location.");
      return;
    }
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, location: effectiveLocation })
      });
      const data = await res.json();
      if (res.ok) {
        setCreateStatus("✓ Event registered — volunteers will now see your collection points");
        setName("Pilot Event");
        setLocation("Palexpo, Geneva");
        setCustomLocation("");
        setExpectedLanyards(100);
        await load();
      } else {
        const msg = (data as { error?: string }).error || "Failed";
        setCreateStatus(
          msg === "UNAUTHENTICATED"
            ? "Error: You must be signed in. Please sign in and try again."
            : `Error: ${msg}`
        );
      }
    } catch {
      setCreateStatus("Error: Network error. Please check your connection and try again.");
    }
  };

  useEffect(() => void load(), []);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
    } catch {
      return d;
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;

  return (
    <main>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--color-primary)" }}>
            <IconCalendar />
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
            Organiser Dashboard
          </h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Register your Geneva event, manage volunteer applications, and track lanyard collection.
        </p>
      </header>

      {/* Deposit model explainer */}
      <section className="card" style={{ marginBottom: 24, padding: 20, background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "var(--color-primary)" }}>Deposit-and-return model</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          <li>Pay <strong>CHF 2 per lanyard</strong> as a refundable deposit when registering your event</li>
          <li>Volunteers collect lanyards at your collection points after the event</li>
          <li>Grade A &amp; B lanyards are returned to the library — deposit refunded within 5 working days</li>
          <li>Grade C lanyards go to upcycling / recycling partners — partial refund (CHF 1) applies</li>
          <li>You receive a <strong>verified impact certificate</strong> showing CO₂ avoided and lanyards diverted</li>
        </ul>
      </section>

      {/* Create event */}
      <section className="card-elevated" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 16px", color: "var(--color-text)" }}>
          Register a new event
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Fill in the event details below. Volunteers will see this event and can express interest in supporting it.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 440 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Event name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Geneva Sustainability Forum 2026"
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Geneva venue *
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: "100%", background: "var(--color-surface)" }}
            >
              {GENEVA_VENUES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {location === "Other Geneva venue" && (
              <input
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter venue name and address"
                style={{ marginTop: 8, padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: "100%" }}
              />
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Expected number of lanyards
            </label>
            <input
              type="number"
              min={1}
              value={expectedLanyards}
              onChange={(e) => setExpectedLanyards(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: 120 }}
            />
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
              Used to estimate your deposit and projected impact.
            </p>
          </div>

          <div style={{ padding: "16px 18px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-primary-muted)" }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: "var(--color-primary)" }}>
              Estimated deposit &amp; impact
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Metric label="Deposit (refundable)" value={`CHF ${depositTotal.toLocaleString()}`} />
              <Metric label="CO₂ if all diverted" value={`≈ ${estimatedCO2} kg`} />
              <Metric label="CHF 2 per lanyard" value="Refunded on return" />
              <Metric label="Impact certificate" value="Issued post-event" />
            </div>
          </div>

          <button
            onClick={createEvent}
            style={{ padding: "10px 18px", fontSize: 14, fontWeight: 500, background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", alignSelf: "flex-start" }}
          >
            Register event
          </button>
          {createStatus && <p style={{ fontSize: 14, color: "var(--color-primary-muted)" }}>{createStatus}</p>}
        </div>
      </section>

      {/* Events list */}
      <section>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 8, color: "var(--color-text)" }}>
          Your registered events
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20 }}>
          Click an event to manage volunteer applications. Approve volunteers to confirm their participation.
        </p>

        {events.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No events yet. Register one above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {events.map((e) => (
              <div key={e.id}>
                <div
                  className="card-elevated"
                  style={{
                    padding: "20px 24px",
                    cursor: "pointer",
                    borderColor: selectedEventId === e.id ? "var(--color-primary)" : undefined,
                    borderWidth: selectedEventId === e.id ? 2 : 1
                  }}
                  onClick={() => selectEvent(e.id)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--color-primary)", marginTop: 2 }}>
                      <IconMapPin />
                    </span>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 6px", color: "var(--color-text)" }}>{e.name}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
                        {e.location} · Registered {formatDate(e.created_at)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)", background: "var(--color-surface-2, #f3f4f6)", padding: "4px 10px", borderRadius: 99 }}>
                        View volunteers ▾
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volunteer applications panel */}
                {selectedEventId === e.id && (
                  <div
                    style={{
                      border: "1px solid var(--color-primary)",
                      borderTop: "none",
                      borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
                      background: "var(--color-surface)",
                      padding: 20
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>
                        Volunteers for: {selectedEvent?.name}
                      </h3>
                      <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>{pendingCount} pending</span>
                        <span style={{ color: "#10b981", fontWeight: 600 }}>{approvedCount} approved</span>
                        <button
                          onClick={() => loadApplications(e.id)}
                          style={{ fontSize: 12, padding: "3px 10px", border: "1px solid var(--color-border)", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--color-text-muted)" }}
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    {loadingApps ? (
                      <p style={{ fontSize: 14, color: "var(--color-text-muted)", padding: "16px 0" }}>Loading applications…</p>
                    ) : applications.length === 0 ? (
                      <div style={{ padding: "24px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
                        No volunteer applications yet. Share your event link to attract volunteers.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {applications.map((app) => (
                          <ApplicationCard
                            key={app.id}
                            app={app}
                            actionStatus={appActionStatus[app.id]}
                            replyValue={replyDraft[app.id] ?? app.organizer_reply ?? ""}
                            notesValue={notesDraft[app.id] ?? app.organizer_notes ?? ""}
                            onReplyChange={(v) => setReplyDraft((prev) => ({ ...prev, [app.id]: v }))}
                            onNotesChange={(v) => setNotesDraft((prev) => ({ ...prev, [app.id]: v }))}
                            onApprove={() => updateApplication(app.id, "approved", replyDraft[app.id], notesDraft[app.id])}
                            onReject={() => updateApplication(app.id, "rejected", replyDraft[app.id], notesDraft[app.id])}
                            onSaveReply={() => updateApplication(app.id, app.status, replyDraft[app.id], notesDraft[app.id])}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ApplicationCard({
  app,
  actionStatus,
  replyValue,
  notesValue,
  onReplyChange,
  onNotesChange,
  onApprove,
  onReject,
  onSaveReply
}: {
  app: Application;
  actionStatus?: string;
  replyValue: string;
  notesValue: string;
  onReplyChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onSaveReply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const vol = app.volunteer;
  const statusColor = STATUS_COLORS[app.status] ?? "#6b7280";
  const statusLabel = STATUS_LABELS[app.status] ?? app.status;

  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-bg)", overflow: "hidden" }}>
      {/* Header row */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>
          {(vol?.display_name || vol?.email || "?").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {vol?.display_name || vol?.email || `Volunteer ${app.volunteer_id.slice(0, 8)}`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {vol?.email} {vol?.city ? `· ${vol.city}` : ""} {vol?.availability ? `· ${vol.availability}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: `${statusColor}18`, padding: "3px 10px", borderRadius: 99, border: `1px solid ${statusColor}40` }}>
            {statusLabel}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--color-border)" }}>
          {/* Volunteer info */}
          {(vol?.motivation || app.message) && (
            <div style={{ marginTop: 12 }}>
              {app.message && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: 4 }}>
                    Volunteer&apos;s message
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-text)", background: "var(--color-accent-soft)", padding: "10px 12px", borderRadius: 6, fontStyle: "italic" }}>
                    &ldquo;{app.message}&rdquo;
                  </div>
                </div>
              )}
              {vol?.motivation && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: 4 }}>
                    Motivation
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{vol.motivation}</div>
                </div>
              )}
            </div>
          )}

          {/* Reply to volunteer */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: 6 }}>
              Reply to volunteer (visible to them)
            </div>
            <textarea
              value={replyValue}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder="e.g. Thank you for your interest! We'd love to have you. Please arrive by 8am at the east entrance."
              rows={3}
              style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-border)", borderRadius: 6, resize: "vertical", background: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>

          {/* Private notes */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: 6 }}>
              Private notes (only you see this)
            </div>
            <input
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Internal notes about this applicant"
              style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-border)", borderRadius: 6, background: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            {app.status !== "approved" && (
              <button
                onClick={onApprove}
                style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600, background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Approve
              </button>
            )}
            {app.status !== "rejected" && (
              <button
                onClick={onReject}
                style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600, background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Decline
              </button>
            )}
            <button
              onClick={onSaveReply}
              style={{ padding: "8px 18px", fontSize: 13, background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 6, cursor: "pointer" }}
            >
              Save reply
            </button>
            {actionStatus && (
              <span style={{ fontSize: 12, color: actionStatus === "saved" ? "#10b981" : actionStatus === "saving" ? "var(--color-text-muted)" : "#ef4444" }}>
                {actionStatus === "saved" ? "✓ Saved" : actionStatus === "saving" ? "Saving…" : actionStatus}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{value}</div>
    </div>
  );
}
