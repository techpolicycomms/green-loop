"use client";

import { useEffect, useRef, useState } from "react";
import { IconHand, IconMapPin, IconCamera, IconCalendar, IconStar, IconClock, IconCheckCircle, IconActivity, IconLock, IconInfo } from "@/components/Icons";

type EventItem = { id: string; name: string; location: string; created_at: string; event_date?: string | null };
type Application = {
  id: string;
  event_id: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  message?: string;
  organizer_reply?: string;
  created_at: string;
  updated_at: string;
  event?: EventItem | null;
};
type HistoryStats = { total_checkins: number; total_lanyards: number; karma_points: number; co2_saved_kg: number; by_grade: Record<string, number> };
type CheckInRecord = { id: string; event_id?: string | null; lat: number; lng: number; created_at: string; event?: { name: string; location: string } | null };
type GradeRecord = { id: string; event_id?: string | null; grade: string; quantity: number; material?: string | null; created_at: string; event?: { name: string } | null };

const LANYARD_GRADES = [
  { value: "A", label: "Grade A — Excellent", description: "Clean, intact strap and clip. Ready for immediate reuse." },
  { value: "B", label: "Grade B — Good", description: "Minor soiling or wear. Suitable for reuse after cleaning." },
  { value: "C", label: "Grade C — Damaged", description: "Broken clip, frayed strap, or heavy soiling. Routed to upcycling or material recycling." }
];

const LANYARD_MATERIALS = [
  { value: "polyester", label: "Polyester (standard)" },
  { value: "recycled_pet", label: "Recycled PET" },
  { value: "bamboo", label: "Bamboo / natural fibre" },
  { value: "nylon", label: "Nylon" },
  { value: "unknown", label: "Unknown / mixed" }
];

const CO2_PER_LANYARD_G = 25;

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: "#92400e", bg: "#fef3c7", label: "Pending review" },
  approved:  { color: "#065f46", bg: "#d1fae5", label: "Approved" },
  rejected:  { color: "#991b1b", bg: "#fee2e2", label: "Not selected" },
  withdrawn: { color: "#374151", bg: "#f3f4f6", label: "Withdrawn" }
};

const WORKFLOW_STEPS = [
  { key: "select",  label: "Select event" },
  { key: "checkin", label: "Check in" },
  { key: "grade",   label: "Grade batch" },
  { key: "photo",   label: "Photograph" }
];

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }); }
  catch { return d; }
}

function fmtEventDate(d: string | null | undefined) {
  if (!d) return null;
  try { return new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

export default function VolunteerPage() {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventsTab, setEventsTab] = useState<"my" | "all">("my");

  const [applyEventId, setApplyEventId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyStatus, setApplyStatus] = useState<Record<string, string>>({});

  const [coords, setCoords] = useState<string>("");
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [grade, setGrade] = useState<string>("A");
  const [material, setMaterial] = useState<string>("polyester");
  const [lanyardCount, setLanyardCount] = useState<number>(1);
  const [gradeStatus, setGradeStatus] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<string>("");

  // #14 Photo preview before upload
  const [pendingPhoto, setPendingPhoto] = useState<{ file: File; previewUrl: string } | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null);
  const [historyCheckIns, setHistoryCheckIns] = useState<CheckInRecord[]>([]);
  const [historyGrades, setHistoryGrades] = useState<GradeRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const co2Saved = Math.round((lanyardCount * CO2_PER_LANYARD_G) / 1000 * 100) / 100;
  const selectedEvent = allEvents.find((e) => e.id === selectedEventId);
  const myApplicationMap = Object.fromEntries(applications.map((a) => [a.event_id, a]));
  const approvedEventIds = new Set(applications.filter((a) => a.status === "approved").map((a) => a.event_id));

  // #2, #10 Workflow step progress
  const gradeDone = gradeStatus.startsWith("✓");
  const photoDone = uploadResult.startsWith("Photo uploaded");
  const stepDone = { select: !!selectedEventId, checkin: !!checkInId, grade: gradeDone, photo: photoDone };
  const activeStepIndex = WORKFLOW_STEPS.findIndex((s) => !stepDone[s.key as keyof typeof stepDone]);
  const currentStep = activeStepIndex === -1 ? WORKFLOW_STEPS.length : activeStepIndex;

  // #11 First-time detection
  const dataLoaded = historyStats !== null || applications.length > 0;
  const isFirstTimeUser = dataLoaded && (!historyStats || historyStats.karma_points === 0) && applications.length === 0;

  const refreshAll = async () => {
    const [evRes, appRes, histRes] = await Promise.all([
      fetch("/api/events", { credentials: "include" }).then((r) => r.json()).catch(() => []),
      fetch("/api/volunteer/applications", { credentials: "include" }).then((r) => r.json()).catch(() => []),
      fetch("/api/volunteer/history", { credentials: "include" }).then((r) => r.json()).catch(() => null)
    ]);
    setAllEvents(Array.isArray(evRes) ? evRes : []);
    setApplications(Array.isArray(appRes) ? appRes : []);
    if (histRes && !histRes.error) {
      setHistoryStats(histRes.stats ?? { total_checkins: 0, total_lanyards: 0, karma_points: 0, co2_saved_kg: 0, by_grade: {} });
      setHistoryCheckIns(histRes.check_ins ?? []);
      setHistoryGrades(histRes.grades ?? []);
    } else if (!histRes || histRes.error) {
      setHistoryStats({ total_checkins: 0, total_lanyards: 0, karma_points: 0, co2_saved_kg: 0, by_grade: {} });
    }
  };

  useEffect(() => { void refreshAll(); }, []);

  // Revoke blob URL on cleanup
  useEffect(() => {
    return () => { if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.previewUrl); };
  }, [pendingPhoto]);

  const applyToEvent = async (eventId: string) => {
    setApplyStatus((p) => ({ ...p, [eventId]: "applying" }));
    try {
      const res = await fetch(`/api/events/${eventId}/applications`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: applyMessage.trim() || undefined })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setApplyStatus((p) => ({ ...p, [eventId]: "applied" }));
        setApplyEventId(null);
        setApplyMessage("");
        await refreshAll();
      } else {
        const msg = (data as { error?: string }).error || "Failed";
        setApplyStatus((p) => ({ ...p, [eventId]: msg === "Already applied to this event" ? "already" : `error:${msg}` }));
      }
    } catch {
      setApplyStatus((p) => ({ ...p, [eventId]: "error:Network error" }));
    }
  };

  // #5 Withdraw with confirmation dialog
  const withdrawApplication = async (appId: string) => {
    if (!window.confirm("Withdraw this application?\n\nYou can re-apply to the event later if it remains open.")) return;
    try {
      await fetch(`/api/events/applications/${appId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "withdrawn" })
      });
      await refreshAll();
    } catch { /* ignore */ }
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setCoords("Geolocation not supported."); return; }
    setCoords("Getting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const data = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setLastCoords(data);
        setCoords(`${data.lat.toFixed(5)}, ${data.lng.toFixed(5)} (±${Math.round(data.accuracy)}m)`);
      },
      (err) => setCoords(`Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const saveLocation = async () => {
    if (!lastCoords) { setSaveStatus("Get your location first."); return; }
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lat: lastCoords.lat, lng: lastCoords.lng, accuracy_m: lastCoords.accuracy, event_id: selectedEventId ?? undefined })
      });
      const data = await res.json();
      if (!res.ok) { setSaveStatus(`Error: ${(data as { error?: string }).error || "Failed"}`); return; }
      setCheckInId((data as { id?: string }).id ?? null);
      setSaveStatus("✓ Check-in confirmed — you are on the loop");
      void refreshAll();
    } catch { setSaveStatus("Error: Could not save"); }
  };

  const saveGrade = async () => {
    if (!selectedEventId) { setGradeStatus("Select an event first."); return; }
    setGradeStatus("Saving...");
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ grade, material, quantity: lanyardCount, event_id: selectedEventId, check_in_id: checkInId ?? undefined })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGradeStatus(`✓ ${lanyardCount} lanyard(s) recorded (Grade ${grade})`);
        void refreshAll();
      } else {
        setGradeStatus(`Error: ${(data as { error?: string }).error ?? "Failed"}`);
      }
    } catch { setGradeStatus("Error: Network error"); }
  };

  const uploadPhoto = async (file: File) => {
    setUploadResult("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("grade", grade);
    fd.append("material", material);
    fd.append("quantity", String(lanyardCount));
    if (checkInId) fd.append("check_in_id", checkInId);
    if (selectedEventId) fd.append("event_id", selectedEventId);
    const res = await fetch("/api/uploads", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => ({ error: "Unknown error" }));
    if (res.ok && (data as { url?: string }).url) {
      setUploadResult(`Photo uploaded — ${lanyardCount} lanyard(s) documented (Grade ${grade})`);
      void refreshAll();
    } else {
      setUploadResult(`Error: ${(data as { error?: string }).error ?? "Upload failed"}`);
    }
  };

  const myEventIds = new Set(applications.filter((a) => a.status !== "withdrawn").map((a) => a.event_id));
  const myEvents = allEvents.filter((e) => myEventIds.has(e.id));
  const otherEvents = allEvents.filter((e) => !myEventIds.has(e.id));
  const workLocked = !selectedEvent;

  // Lock overlay element (#4)
  const LockOverlay = ({ message }: { message: string }) => (
    <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "rgba(250,249,246,0.88)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, gap: 10, textAlign: "center", padding: 16 }}>
      <span style={{ color: "var(--color-text-muted)", opacity: 0.7 }}><IconLock /></span>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, fontWeight: 500 }}>{message}</p>
    </div>
  );

  return (
    <main>
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "var(--color-primary)" }}><IconHand /></span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Volunteer Dashboard</h1>
        </div>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Collect, grade, and document lanyards at Geneva events. Every lanyard you divert earns karma points.
        </p>
      </header>

      {/* #11 First-time onboarding prompt */}
      {isFirstTimeUser && (
        <div role="status" style={{ marginBottom: 24, padding: "20px 24px", background: "var(--color-accent-soft)", border: "1px solid var(--color-primary-muted)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 2 }}><IconInfo /></span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--color-primary)", margin: "0 0 10px" }}>Welcome! Here&apos;s how to get started</p>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.85 }}>
                <li>Browse open events below and <strong>apply to volunteer</strong> at one that fits your schedule</li>
                <li>Once the organiser approves you, <strong>GPS check in</strong> at the collection point</li>
                <li><strong>Grade the lanyards</strong> you collect (A = reuse · B = clean &amp; reuse · C = upcycle)</li>
                <li><strong>Photograph the batch</strong> for the organiser&apos;s impact certificate</li>
                <li>Earn <strong>10 karma points</strong> per lanyard diverted from landfill</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* #2, #10 Workflow progress tracker */}
      <nav aria-label="Volunteer workflow steps" style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "12px 16px", overflowX: "auto" }}>
        {WORKFLOW_STEPS.map((step, i) => {
          const done = stepDone[step.key as keyof typeof stepDone];
          const active = i === currentStep;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#10b981" : active ? "var(--color-primary)" : "var(--color-border)", color: done || active ? "#fff" : "var(--color-text-muted)", flexShrink: 0 }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 13, whiteSpace: "nowrap", color: active ? "var(--color-text)" : done ? "#10b981" : "var(--color-text-muted)", fontWeight: active || done ? 600 : 400 }}>
                  {step.label}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{ width: 28, height: 1.5, background: done ? "#10b981" : "var(--color-border)", margin: "0 8px", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </nav>

      {/* #12 Karma panel — always visible, shown before work sections */}
      <div className="card" style={{ marginBottom: 24, padding: "16px 20px", background: "var(--color-accent-soft)", borderColor: "var(--color-primary-muted)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--color-primary)" }}><IconStar /></span>
              <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-primary)", letterSpacing: "-0.02em" }}>
                {historyStats?.karma_points.toLocaleString() ?? "0"} pts
              </span>
            </div>
            {historyStats && historyStats.total_lanyards > 0 ? (
              [{ v: historyStats.total_lanyards, l: "lanyards" }, { v: `${historyStats.co2_saved_kg} kg`, l: "CO₂ saved" }, { v: historyStats.total_checkins, l: "check-ins" }].map((m) => (
                <div key={m.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)" }}>{m.v}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{m.l}</div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Complete your first check-in to start earning karma points</span>
            )}
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
            <IconClock /> {showHistory ? "Hide history" : "My history"}
          </button>
        </div>
      </div>

      {/* Event selection */}
      <section className="card-elevated" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}><IconCalendar /></span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Events</h2>
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--color-border)" }}>
          {([["my", "My events"], ["all", "Browse all"]] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setEventsTab(tab)} style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", color: eventsTab === tab ? "var(--color-primary)" : "var(--color-text-muted)", borderBottom: eventsTab === tab ? "2px solid var(--color-primary)" : "2px solid transparent", marginBottom: -2 }}>
              {label}
              {tab === "my" && myEvents.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, background: "var(--color-primary)", color: "white", borderRadius: 99, padding: "1px 7px" }}>{myEvents.length}</span>
              )}
            </button>
          ))}
        </div>

        {eventsTab === "my" && (
          <div>
            {myEvents.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>🌿</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>No event applications yet</p>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 auto 16px", maxWidth: 320 }}>
                  Browse open events, apply to volunteer, and the organiser will confirm your spot.
                </p>
                <button onClick={() => setEventsTab("all")} className="btn btn-primary btn-sm">Browse open events →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myEvents.map((e) => {
                  const app = myApplicationMap[e.id];
                  const styles = STATUS_STYLES[app?.status ?? "pending"];
                  const isSelected = selectedEventId === e.id;
                  return (
                    <div key={e.id} style={{ border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", cursor: "pointer", background: isSelected ? "var(--color-accent-soft)" : "var(--color-surface)" }} onClick={() => setSelectedEventId(isSelected ? null : e.id)}>
                        <span style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }}><IconMapPin /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>{e.name}</div>
                          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{e.location}</div>
                          {e.event_date && (
                            <div style={{ fontSize: 12, color: "var(--color-primary-muted)", marginTop: 3, fontWeight: 500 }}>📅 {fmtEventDate(e.event_date)}</div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: styles.color, background: styles.bg, padding: "3px 10px", borderRadius: 99, border: `1px solid ${styles.color}30` }}>{styles.label}</span>
                          {/* #9 — response timeframe for pending */}
                          {app?.status === "pending" && (
                            <span style={{ fontSize: 10, color: "var(--color-text-subtle)", textAlign: "right", maxWidth: 130, lineHeight: 1.3 }}>Organisers typically respond within 1–3 days</span>
                          )}
                          {isSelected && <span style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 600 }}>● Working here</span>}
                        </div>
                      </div>
                      {app?.organizer_reply && (
                        <div style={{ padding: "10px 16px", background: app.status === "approved" ? "#d1fae5" : "#f3f4f6", borderTop: "1px solid var(--color-border)", fontSize: 13 }}>
                          <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>{app.status === "approved" ? "✓ Organiser message:" : "Organiser reply:"}</strong>
                          <p style={{ margin: "4px 0 0", color: "var(--color-text)", fontStyle: "italic" }}>&ldquo;{app.organizer_reply}&rdquo;</p>
                        </div>
                      )}
                      {/* #5 Withdraw with confirmation */}
                      {app && app.status === "pending" && (
                        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                          <button onClick={() => withdrawApplication(app.id)} style={{ fontSize: 12, color: "var(--color-text-muted)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                            Withdraw application
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Browse all — #8 "Apply to volunteer" */}
        {eventsTab === "all" && (
          <div>
            {allEvents.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>No active events found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myEvents.length > 0 && <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 4px" }}>Already applied ({myEvents.length}) — scroll down for other events</p>}
                {allEvents.map((e) => {
                  const app = myApplicationMap[e.id];
                  const hasApplied = !!app && app.status !== "withdrawn";
                  const appStyles = app ? STATUS_STYLES[app.status] : null;
                  const isApplying = applyEventId === e.id;
                  const astatus = applyStatus[e.id];
                  const isSelected = selectedEventId === e.id;
                  return (
                    <div key={e.id} style={{ border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-surface)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px" }}>
                        <span style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }}><IconMapPin /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>{e.name}</div>
                          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{e.location}</div>
                          {e.event_date ? (
                            <div style={{ fontSize: 12, color: "var(--color-primary-muted)", marginTop: 3, fontWeight: 500 }}>📅 {fmtEventDate(e.event_date)}</div>
                          ) : (
                            <div style={{ fontSize: 11, color: "var(--color-text-subtle)", marginTop: 2 }}>Registered {fmtDate(e.created_at)}</div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                          {appStyles && <span style={{ fontSize: 11, fontWeight: 600, color: appStyles.color, background: appStyles.bg, padding: "3px 10px", borderRadius: 99 }}>{appStyles.label}</span>}
                          {!hasApplied && (
                            <button onClick={() => setApplyEventId(isApplying ? null : e.id)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 14px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                              {isApplying ? "Cancel" : "Apply to volunteer"}
                            </button>
                          )}
                          {hasApplied && app?.status !== "rejected" && (
                            <button onClick={() => setSelectedEventId(isSelected ? null : e.id)} style={{ fontSize: 12, padding: "5px 14px", background: isSelected ? "var(--color-primary)" : "transparent", color: isSelected ? "white" : "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 6, cursor: "pointer" }}>
                              {isSelected ? "● Selected" : "Select event"}
                            </button>
                          )}
                        </div>
                      </div>
                      {isApplying && (
                        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 12, marginBottom: 8 }}>Tell the organiser why you&apos;d like to volunteer (optional):</p>
                          <textarea value={applyMessage} onChange={(ev) => setApplyMessage(ev.target.value)} placeholder="e.g. I'm passionate about sustainability and have volunteered at 3 events before…" rows={3} style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-border)", borderRadius: 6, resize: "vertical", background: "var(--color-surface)", color: "var(--color-text)" }} />
                          <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                            <button onClick={() => applyToEvent(e.id)} disabled={astatus === "applying"} style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, background: "var(--color-primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                              {astatus === "applying" ? "Sending…" : "Send application"}
                            </button>
                            {astatus && astatus !== "applying" && <span style={{ fontSize: 12, color: astatus === "applied" ? "#10b981" : "#ef4444" }}>{astatus === "applied" ? "✓ Application sent!" : astatus.replace("error:", "")}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {otherEvents.length === 0 && myEvents.length > 0 && <p style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center", paddingTop: 8 }}>You&apos;ve applied to all available events.</p>}
              </div>
            )}
          </div>
        )}

        {selectedEvent && (
          <div style={{ marginTop: 16, padding: "10px 16px", background: "var(--color-primary)", borderRadius: "var(--radius-sm)", color: "white", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span><IconCheckCircle /> Working on: <strong>{selectedEvent.name}</strong></span>
            <button onClick={() => setSelectedEventId(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 4, padding: "2px 10px", cursor: "pointer", fontSize: 12 }}>Change</button>
          </div>
        )}
        {!selectedEvent && approvedEventIds.size > 0 && (
          <div style={{ marginTop: 12, padding: "8px 14px", background: "var(--color-accent-soft)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-text-muted)" }}>
            Select an approved event above to unlock check-in and grading.
          </div>
        )}
      </section>

      {/* Step 1 · GPS check-in (#1 moved before grading, #4 lock overlay) */}
      <section className="card-elevated" style={{ marginBottom: 24, position: "relative" }}>
        {workLocked && <LockOverlay message="Select an approved event above to enable GPS check-in" />}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", background: "var(--color-accent-soft)", padding: "2px 10px", borderRadius: 99, letterSpacing: "0.05em", textTransform: "uppercase" }}>Step 1</span>
          {checkInId && <span className="badge badge-success">✓ Confirmed</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}><IconMapPin /></span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>GPS check-in</h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Share your location to confirm your presence at the collection point. This links your grades to this venue.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={getLocation} className="btn btn-primary btn-sm">Get my location</button>
          <button onClick={saveLocation} disabled={!lastCoords} className={`btn btn-sm ${lastCoords ? "btn-secondary" : "btn-ghost"}`}>Confirm check-in</button>
        </div>
        {coords && <p style={{ marginTop: 12, padding: "10px 14px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>{coords}</p>}
        {saveStatus && <p role="status" aria-live="polite" style={{ marginTop: 8, fontSize: 14, color: saveStatus.includes("Error") ? "var(--color-error)" : "var(--color-success)" }}>{saveStatus}</p>}
      </section>

      {/* #12 Karma rewards — before grading to anchor motivation */}
      <section className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ color: "var(--color-primary)" }}><IconStar /></span>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Karma rewards</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[{ pts: "10 pts", reward: "Per lanyard collected & documented" }, { pts: "100 pts", reward: "1 free community event ticket" }, { pts: "500 pts", reward: "Annual Geneva tram day-pass" }, { pts: "1 000 pts", reward: "Partner NGO membership" }].map((r) => (
            <div key={r.reward} style={{ padding: "12px 14px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>{r.pts}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{r.reward}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 2 · Lanyard grading (#1 now after GPS, #4 lock overlay) */}
      <section className="card-elevated" style={{ marginBottom: 24, position: "relative" }}>
        {workLocked && <LockOverlay message="Select an approved event above to enable lanyard grading" />}
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", background: "var(--color-accent-soft)", padding: "2px 10px", borderRadius: 99, letterSpacing: "0.05em", textTransform: "uppercase" }}>Step 2</span>
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px" }}>Lanyard grading</h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          Record the condition and material of the batch you collected.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label>Number of lanyards in batch</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="number" min={1} max={10000} value={lanyardCount} onChange={(e) => setLanyardCount(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 100 }} />
              {lanyardCount > 0 && <span style={{ fontSize: 13, color: "var(--color-primary-muted)" }}>{co2Saved > 0 ? co2Saved : "<0.01"} kg CO₂ saved if diverted</span>}
            </div>
          </div>
          <div>
            <label>Condition grade</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LANYARD_GRADES.map((g) => (
                <label key={g.value} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-sm)", border: `2px solid ${grade === g.value ? "var(--color-primary)" : "var(--color-border)"}`, background: grade === g.value ? "var(--color-accent-soft)" : "var(--color-surface)", cursor: "pointer" }}>
                  <input type="radio" name="grade" value={g.value} checked={grade === g.value} onChange={() => setGrade(g.value)} style={{ marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{g.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label>Strap material</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} style={{ maxWidth: 300 }}>
              {LANYARD_MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <button onClick={saveGrade} disabled={!selectedEvent} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, background: selectedEvent ? "var(--color-primary)" : "var(--color-border)", color: selectedEvent ? "white" : "var(--color-text-muted)", border: "none", borderRadius: "var(--radius-sm)", cursor: selectedEvent ? "pointer" : "default" }}>
              Log {lanyardCount} lanyard{lanyardCount !== 1 ? "s" : ""} (Grade {grade})
            </button>
            {gradeStatus && <p role="status" aria-live="polite" style={{ marginTop: 8, fontSize: 14, color: gradeStatus.startsWith("Error") ? "var(--color-error)" : "var(--color-success)" }}>{gradeStatus}</p>}
          </div>
        </div>
      </section>

      {/* Step 3 · Photo documentation (#14 preview before upload, #4 lock) */}
      <section className="card-elevated" style={{ marginBottom: 24, position: "relative" }}>
        {workLocked && <LockOverlay message="Select an approved event above to enable photo upload" />}
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", background: "var(--color-accent-soft)", padding: "2px 10px", borderRadius: 99, letterSpacing: "0.05em", textTransform: "uppercase" }}>Step 3</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)" }}><IconCamera /></span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Photo documentation</h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
          Photograph the collected batch for impact verification and the organiser&apos;s certificate.
        </p>

        {pendingPhoto ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingPhoto.previewUrl} alt="Preview of selected batch photo" style={{ maxWidth: "100%", maxHeight: 220, borderRadius: "var(--radius-sm)", objectFit: "cover", border: "1px solid var(--color-border)", display: "block", marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12 }}>Confirm this is the correct batch photo before uploading.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { uploadPhoto(pendingPhoto.file); URL.revokeObjectURL(pendingPhoto.previewUrl); setPendingPhoto(null); }} className="btn btn-primary btn-sm">Confirm &amp; upload</button>
              <button onClick={() => { URL.revokeObjectURL(pendingPhoto.previewUrl); setPendingPhoto(null); if (photoInputRef.current) photoInputRef.current.value = ""; }} className="btn btn-secondary btn-sm">Choose different photo</button>
            </div>
          </div>
        ) : (
          <label className="drop-zone" style={{ cursor: "pointer" }}>
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingPhoto({ file: f, previewUrl: URL.createObjectURL(f) }); e.target.value = ""; }} style={{ display: "none" }} />
            <span style={{ color: "var(--color-primary)" }}><IconCamera /></span>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--color-text-muted)" }}>Tap to take a photo or choose from gallery</p>
          </label>
        )}

        {uploadResult && <p role="status" aria-live="polite" style={{ marginTop: 12, fontSize: 14, color: uploadResult.startsWith("Error") ? "var(--color-error)" : "var(--color-success)" }}>{uploadResult}</p>}
      </section>

      {/* #13 History — always accessible, always visible header */}
      <section className="card-elevated">
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setShowHistory(!showHistory)}>
          <span style={{ color: "var(--color-primary)" }}><IconActivity /></span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>My contribution history</h2>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-muted)", userSelect: "none" }}>{showHistory ? "▲ Collapse" : "▼ Expand"}</span>
        </div>

        {showHistory && (
          <div style={{ marginTop: 20 }}>
            {historyStats && historyStats.total_lanyards > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 24 }}>
                {Object.entries(historyStats.by_grade).map(([g, n]) => (
                  <div key={g} className="card" style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: g === "A" ? "#10b981" : g === "B" ? "#f59e0b" : "#ef4444" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Grade {g}</div>
                  </div>
                ))}
              </div>
            )}
            {historyCheckIns.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 10 }}>Recent check-ins</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {historyCheckIns.slice(0, 8).map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--color-primary)", flexShrink: 0 }}><IconMapPin /></span>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{c.event?.name ?? "No event linked"}</div>
                        {c.event?.location && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{c.event.location}</div>}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)", flexShrink: 0 }}>{fmtDate(c.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {historyGrades.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 10 }}>Grade records</h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Event</th><th>Grade</th><th>Qty</th><th>Material</th><th>Date</th></tr></thead>
                    <tbody>
                      {historyGrades.slice(0, 15).map((g) => (
                        <tr key={g.id}>
                          <td>{g.event?.name ?? "—"}</td>
                          <td><span className={`badge ${g.grade === "A" ? "badge-success" : g.grade === "B" ? "badge-warning" : "badge-error"}`}>{g.grade}</span></td>
                          <td>{g.quantity}</td>
                          <td className="td-muted">{g.material ?? "—"}</td>
                          <td className="td-muted">{fmtDate(g.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {historyCheckIns.length === 0 && historyGrades.length === 0 && (
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", textAlign: "center", padding: "24px 0" }}>
                No contributions yet. Complete your first check-in above to start earning karma points.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
