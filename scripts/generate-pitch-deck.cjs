/**
 * LémanLoop Pitch Deck — PDF Generator
 * Run: node scripts/generate-pitch-deck.js
 * Output: LémanLoop-PitchDeck-2026.pdf
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  green:       "#15803d",
  greenDark:   "#14532d",
  greenMid:    "#22c55e",
  greenLight:  "#dcfce7",
  greenPale:   "#f0fdf4",
  white:       "#ffffff",
  dark:        "#0f1923",
  text:        "#1a2332",
  muted:       "#64748b",
  faint:       "#94a3b8",
  bg:          "#f8fafc",
  border:      "#e2e8f0",
  blue:        "#1d4ed8",
  blueLight:   "#dbeafe",
  amber:       "#d97706",
  amberLight:  "#fef3c7",
  red:         "#dc2626",
  redLight:    "#fee2e2",
  slate:       "#334155",
};

// A4 landscape
const W = 841.89;
const H = 595.28;

const doc = new PDFDocument({
  size: [W, H],
  margin: 0,
  info: {
    Title:    "LémanLoop — Investor Pitch Deck 2026",
    Author:   "LémanLoop Team",
    Subject:  "Circular Lanyard Economy · Geneva",
    Keywords: "sustainability, circular economy, lanyards, Geneva, green tech",
    Creator:  "LémanLoop Platform"
  }
});

const OUT = path.join(__dirname, "..", "LémanLoop-PitchDeck-2026.pdf");
doc.pipe(fs.createWriteStream(OUT));

// ── Helpers ────────────────────────────────────────────────────────────────

function rect(x, y, w, h, color, radius = 0) {
  doc.save();
  if (radius > 0) doc.roundedRect(x, y, w, h, radius).fill(color);
  else            doc.rect(x, y, w, h).fill(color);
  doc.restore();
}

function text(str, x, y, opts = {}) {
  const {
    size = 11, color = C.text, font = "Helvetica", align = "left",
    width, lineGap = 2, opacity = 1
  } = opts;
  doc.save();
  doc.fillColor(color).font(font).fontSize(size).fillOpacity(opacity);
  const o = { align, lineGap };
  if (width) o.width = width;
  doc.text(str, x, y, o);
  doc.restore();
}

function circle(x, y, r, color) {
  doc.save().circle(x, y, r).fill(color).restore();
}

function line(x1, y1, x2, y2, color, w = 1) {
  doc.save().moveTo(x1, y1).lineTo(x2, y2)
    .strokeColor(color).lineWidth(w).stroke().restore();
}

function tag(label, x, y, bg, fg) {
  const tw = doc.font("Helvetica-Bold").fontSize(9).widthOfString(label) + 16;
  rect(x, y, tw, 18, bg, 9);
  text(label, x + 8, y + 4, { size: 9, color: fg, font: "Helvetica-Bold" });
  return x + tw + 8;
}

// Slide header band (green left accent + title)
function slideHeader(title, subtitle = "") {
  rect(0, 0, W, H, C.bg);
  rect(0, 0, 6, H, C.green);                          // left accent strip
  rect(0, 0, W, 72, C.white);                         // top white band
  line(0, 72, W, 72, C.border, 0.5);
  rect(6, 0, 290, 72, C.green);                       // green title block
  text("LémanLoop", 22, 12, { size: 11, color: C.greenLight, font: "Helvetica" });
  text(title, 22, 28, { size: 20, color: C.white, font: "Helvetica-Bold" });
  if (subtitle) text(subtitle, 22, 52, { size: 9, color: "#86efac", font: "Helvetica" });
  // Slide number in top right
  doc.save().fillColor(C.faint).font("Helvetica").fontSize(9)
     .text(`${doc.bufferedPageRange().count}  /  10`, 0, 28, { align: "right", width: W - 20 });
  doc.restore();
}

// Stat card
function statCard(x, y, w, h, value, label, sub, bg = C.greenLight, vc = C.green, lc = C.muted) {
  rect(x, y, w, h, bg, 8);
  text(value, x + 14, y + 14, { size: 22, color: vc, font: "Helvetica-Bold", width: w - 28 });
  text(label, x + 14, y + 42, { size: 10, color: C.text, font: "Helvetica-Bold", width: w - 28 });
  if (sub) text(sub, x + 14, y + 56, { size: 8.5, color: lc, width: w - 28, lineGap: 1 });
}

// Process step
function step(num, x, y, w, title, desc, color = C.green) {
  circle(x + w / 2, y + 22, 22, color);
  text(String(num), x + w / 2 - 6, y + 14, { size: 18, color: C.white, font: "Helvetica-Bold" });
  text(title, x, y + 52, { size: 9.5, color: C.text, font: "Helvetica-Bold", align: "center", width: w });
  text(desc, x, y + 66, { size: 8, color: C.muted, align: "center", width: w, lineGap: 1 });
}

// Arrow
function arrow(x, y, color = C.border) {
  doc.save().fillColor(color)
     .moveTo(x, y).lineTo(x + 14, y + 6).lineTo(x, y + 12).fill();
  doc.restore();
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ══════════════════════════════════════════════════════════════════════════

rect(0, 0, W, H, C.dark);           // full dark background
rect(0, 0, 380, H, C.green);        // green left panel

// Leaf / logo mark
circle(190, 100, 38, C.greenDark);
text("🌿", 172, 80, { size: 30 });

// Brand name
doc.save().fillColor(C.white).font("Helvetica-Bold").fontSize(36)
   .text("LémanLoop", 36, 150);
doc.restore();

// Tagline
doc.save().fillColor("#86efac").font("Helvetica").fontSize(14)
   .text("Closing the conference lanyard loop", 36, 196);
doc.restore();

// Sub-tagline
doc.save().fillColor("#bbf7d0").font("Helvetica").fontSize(11)
   .text("A deposit-backed circular economy for event lanyards\nin Geneva and beyond", 36, 218, { lineGap: 3 });
doc.restore();

// Divider
line(36, 268, 340, 268, "#4ade80", 0.8);

// Meta info
text("Geneva, Switzerland", 36, 280, { size: 10, color: "#86efac", font: "Helvetica" });
text("Pitch Deck · February 2026", 36, 296, { size: 9, color: "#4ade80", font: "Helvetica" });
text("CONFIDENTIAL", 36, 312, { size: 8, color: "#22c55e", font: "Helvetica-Bold" });

// Right panel content
text("THE PROBLEM", 420, 120, { size: 9, color: C.faint, font: "Helvetica-Bold" });
doc.save().fillColor(C.white).font("Helvetica-Bold").fontSize(28)
   .text("Millions of\nlanyards\ndiscarded\nevery year.", 420, 138, { lineGap: 4 });
doc.restore();

line(420, 240, 800, 240, "#334155", 0.5);

text("OUR ANSWER", 420, 256, { size: 9, color: C.faint, font: "Helvetica-Bold" });
doc.save().fillColor("#94a3b8").font("Helvetica").fontSize(12)
   .text("Organisers pay a CHF 2 deposit per lanyard.\nVolunteers collect, grade, and document.\nLanyards return to a circular library.", 420, 274, { lineGap: 4 });
doc.restore();

line(420, 338, 800, 338, "#334155", 0.5);

// Stat pills
const pills = [
  ["CHF 2", "deposit per lanyard"],
  ["150+", "Geneva events / yr"],
  ["25 g CO₂", "per lanyard produced"]
];
pills.forEach(([val, lbl], i) => {
  const px = 420 + i * 140;
  rect(px, 355, 130, 52, "#1e293b", 6);
  text(val, px + 10, px > 600 ? 360 : 360, { size: 13, color: C.greenMid, font: "Helvetica-Bold" });
  text(lbl, px + 10, 378, { size: 8, color: C.faint, width: 110, lineGap: 1 });
});

// Contact
text("lemanloop.ch  ·  info@lemanloop.ch", 420, 440, { size: 9, color: "#475569" });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Problem
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("The Problem", "Single-use lanyards are a hidden waste crisis at every conference");

// Problem statement
text(
  "Every year, hundreds of millions of conference lanyards are produced from virgin polyester, worn once, and thrown away. In Geneva alone — home to the UN, WHO, WEF, ICRC and 150+ international events — this represents an enormous and completely avoidable waste stream.",
  20, 86, { size: 10.5, color: C.text, width: W - 40, lineGap: 3 }
);

// Four stat cards
const stats2 = [
  ["500 M+", "lanyards produced\nglobally each year", "at conferences, expos & events", C.redLight, C.red],
  ["95 %", "end up in landfill\nwithin 48 hours", "of the event closing", C.amberLight, C.amber],
  ["CHF 8+", "average cost per\nnew lanyard", "materials, printing & logistics", C.blueLight, C.blue],
  ["25 g CO₂", "per lanyard\nproduced", "from virgin polyester", C.greenLight, C.green],
];
const cardW = (W - 80) / 4;
stats2.forEach(([val, lbl, sub, bg, vc], i) => {
  statCard(20 + i * (cardW + 13), 130, cardW, 105, val, lbl, sub, bg, vc, C.muted);
});

// Geneva context box
rect(20, 254, W - 40, 98, C.dark, 8);
text("🇨🇭  Geneva Context", 36, 265, { size: 11, color: C.greenMid, font: "Helvetica-Bold" });
const genevaFacts = [
  "150+ major international conferences annually (UN, WEF, IAEA, ICRC, WHO, ITU and more)",
  "Average 800 lanyards per event → 120,000+ lanyards per year in Geneva alone, nearly all discarded",
  "Growing ESG mandates from organisers with no scalable solution available today",
  "Lake Geneva region has one of the highest event densities in Europe — ideal pilot territory",
];
genevaFacts.forEach((f, i) => {
  circle(38, 288 + i * 16, 3, C.greenMid);
  text(f, 48, 283 + i * 16, { size: 9, color: "#cbd5e1", width: W - 80 });
});

// Quote / call-out
rect(20, 362, W - 40, 45, C.greenLight, 8);
text(
  "\"There is no reason a lanyard that cost CHF 8 to produce and was worn for 3 hours should go straight to landfill. LémanLoop makes the loop obvious and frictionless.\"",
  36, 371, { size: 9.5, color: C.greenDark, width: W - 80, font: "Helvetica-Oblique" }
);

// Footer
text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — The Solution
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("The Solution", "A deposit-backed circular economy for conference lanyards");

// Three actor columns
const cols = [
  { icon: "🏢", title: "Event Organiser", color: C.blue, light: C.blueLight,
    points: [
      "Registers event on LémanLoop",
      "Pays CHF 2 refundable deposit per lanyard",
      "Volunteers are dispatched to collection points",
      "Receives verified impact certificate post-event",
      "Gets ESG reporting data for annual sustainability report",
    ]},
  { icon: "🌿", title: "Volunteer", color: C.green, light: C.greenLight,
    points: [
      "Sees live map of upcoming events",
      "Signs up and GPS check-in at the collection point",
      "Collects, grades (A/B/C) and photographs batches",
      "Earns karma points redeemable for event tickets & rewards",
      "Builds a local sustainability community",
    ]},
  { icon: "♻️", title: "The Lanyard", color: "#7c3aed", light: "#ede9fe",
    points: [
      "Grade A (Excellent) → Reuse library for next event",
      "Grade B (Good) → Cleaned and returned to library",
      "Grade C (Damaged) → Upcycling or material recycling",
      "Every lanyard exits with a documented destination",
      "Library lanyards cost CHF 1.50 vs CHF 8+ for new",
    ]},
];

cols.forEach(({ icon, title, color, light, points }, i) => {
  const cx = 20 + i * 270;
  rect(cx, 86, 255, 340, light, 10);
  rect(cx, 86, 255, 50, color, 10);
  rect(cx, 108, 255, 28, color); // square bottom of header
  text(icon + "  " + title, cx + 14, 98, { size: 12, color: C.white, font: "Helvetica-Bold", width: 230 });
  points.forEach((pt, j) => {
    circle(cx + 22, 156 + j * 48, 4, color);
    text(pt, cx + 32, 149 + j * 48, { size: 9, color: C.text, width: 216, lineGap: 1.5 });
  });
});

// Bottom value proposition
rect(20, 438, W - 40, 60, C.dark, 8);
text("LémanLoop creates a closed-loop system where every lanyard has a use, every volunteer earns, every organiser gets proof of impact, and landfill waste drops to zero.", 36, 448, { size: 10, color: C.white, width: W - 80, lineGap: 3 });
text("No complexity. No new infrastructure. Just an app, a deposit, and a community.", 36, 476, { size: 9, color: "#86efac", width: W - 80 });

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — How It Works
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("How It Works", "Six steps that close the loop — from event to reuse library");

const steps = [
  { n: 1, title: "Register Event", desc: "Organiser logs event on\nLémanLoop platform\n& pays CHF 2/lanyard", color: C.blue },
  { n: 2, title: "Volunteers Recruited", desc: "Platform notifies local\nvolunteers of collection\nopportunity", color: C.blue },
  { n: 3, title: "GPS Check-in", desc: "Volunteer arrives,\nconfirms location via\nmobile GPS", color: C.green },
  { n: 4, title: "Collect & Grade", desc: "Lanyards sorted into\nGrade A, B, or C\nand photographed", color: C.green },
  { n: 5, title: "Certificate Issued", desc: "Organiser receives\nverified impact report\n& deposit refund", color: "#7c3aed" },
  { n: 6, title: "Reuse Library", desc: "Grade A/B lanyards\nrented to next event\nat CHF 1.50 each", color: "#7c3aed" },
];

const sw = 128;
const sy = 140;
steps.forEach(({ n, title, desc, color }, i) => {
  const sx = 20 + i * (sw + 14);
  step(n, sx, sy, sw, title, desc, color);
  if (i < 5) arrow(sx + sw + 1, sy + 16, "#64748b");
});

// Return arrow (loop)
doc.save()
   .moveTo(20, sy + 110)
   .lineTo(W - 20, sy + 110)
   .strokeColor(C.green).lineWidth(1.5).dash(6, { space: 3 }).stroke();
doc.restore();
text("↖  Loop closed — lanyard re-enters the circular library for the next event", W / 2 - 200, sy + 116, { size: 8, color: C.green, font: "Helvetica-Bold" });

// Deposit flow diagram
rect(20, 270, W - 40, 138, C.bg, 8);
line(20, 270, W - 20, 270, C.border, 0.5);
text("Deposit Flow", 34, 280, { size: 10, color: C.text, font: "Helvetica-Bold" });

const flows = [
  { label: "Organiser pays", amount: "CHF 2.00 / lanyard", color: C.blue, x: 34 },
  { label: "Grade A / B → Full refund", amount: "CHF 2.00 returned", color: C.green, x: 240 },
  { label: "Grade C → Partial refund", amount: "CHF 1.00 returned", color: C.amber, x: 450 },
  { label: "Platform fee", amount: "CHF 0.20 / lanyard", color: C.muted, x: 650 },
];

flows.forEach(({ label, amount, color, x }) => {
  rect(x, 298, 175, 56, C.white, 6);
  line(x, 298, x + 175, 298, color, 3);
  text(label, x + 10, 306, { size: 8.5, color: C.text, font: "Helvetica-Bold" });
  text(amount, x + 10, 322, { size: 11, color, font: "Helvetica-Bold" });
});

// Economics callout
rect(20, 420, W - 40, 58, C.greenLight, 8);
text("Unit Economics — Example: 500-lanyard event", 34, 430, { size: 10, color: C.greenDark, font: "Helvetica-Bold" });
const econ = ["Deposit collected: CHF 1,000", "Logistics cost: CHF 90", "Refunds (90% A/B rate): CHF 900", "Net retained: CHF ~110 + certificate fee", "CO₂ avoided: 12.5 kg"];
econ.forEach((e, i) => {
  text("· " + e, 34 + i * 156, 447, { size: 8.5, color: C.greenDark, width: 150 });
});

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Market Opportunity
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("Market Opportunity", "Geneva is the ideal launchpad for a global circular economy model");

// TAM / SAM / SOM
const markets = [
  { label: "TAM", full: "Total Addressable Market", value: "CHF 1 B+", desc: "Global conference lanyard\nmarket (production cost)", color: "#f1f5f9", vc: C.slate },
  { label: "SAM", full: "Serviceable Addressable Market", value: "CHF 12 M", desc: "European conference hubs:\nGeneva, Zurich, Brussels, Vienna", color: C.blueLight, vc: C.blue },
  { label: "SOM", full: "Serviceable Obtainable Market", value: "CHF 480 K", desc: "Greater Geneva region:\n240 events · 1,000 avg lanyards", color: C.greenLight, vc: C.green },
];
markets.forEach(({ label, full, value, desc, color, vc }, i) => {
  const r = 75 - i * 18;
  circle(125 + i * 0, 250, r, color);
  text(label, 125 - r + 8, 250 - 10, { size: 10, color: vc, font: "Helvetica-Bold", width: r * 2 - 16, align: "center" });
  text(value, 125 - r + 4, 266, { size: i === 0 ? 9 : 10, color: vc, font: "Helvetica-Bold", width: r * 2 - 8, align: "center" });
});
// Legend
markets.forEach(({ label, full, value, desc, color, vc }, i) => {
  rect(26, 96 + i * 96, 200, 82, color, 8);
  text(label, 38, 106 + i * 96, { size: 13, color: vc, font: "Helvetica-Bold" });
  text(full, 38, 122 + i * 96, { size: 8, color: C.muted, width: 180 });
  text(value, 38, 136 + i * 96, { size: 14, color: vc, font: "Helvetica-Bold" });
  text(desc, 38, 154 + i * 96, { size: 8, color: C.muted, width: 180, lineGap: 1 });
});

// Right column: market tailwinds
rect(280, 88, W - 300, 340, C.white, 8);
rect(280, 88, W - 300, 6, C.green, 8); rect(280, 92, W - 300, 2, C.green); // top border
text("Market Tailwinds", 294, 102, { size: 11, color: C.text, font: "Helvetica-Bold" });

const tailwinds = [
  ["🌍 ESG Mandates Growing", "ISO 20121 sustainable events standard now expected by UN, EU and major corporates. Organisers need documented proof."],
  ["🇨🇭 Geneva's Unique Density", "No city of its size hosts more international organisations. 150+ annual events = a ready-made pilot market."],
  ["♻️ Circular Economy Policy", "EU Ecodesign Regulation 2024 and Swiss green public procurement push create regulatory tailwinds."],
  ["👥 Volunteer Economy", "Post-pandemic rise in community volunteering. Karma-point models proven by Ecosia, Too Good to Go, and Olio."],
  ["💻 Platform Ready", "No competitors in this niche. First-mover advantage in a market with high switching costs once the library is built."],
];
tailwinds.forEach(([title, desc], i) => {
  rect(292, 122 + i * 62, W - 320, 54, C.bg, 6);
  text(title, 304, 130 + i * 62, { size: 9.5, color: C.text, font: "Helvetica-Bold", width: W - 340 });
  text(desc, 304, 144 + i * 62, { size: 8.5, color: C.muted, width: W - 340, lineGap: 1 });
});

// Bottom summary band
rect(20, 438, W - 40, 58, C.dark, 8);
text("Growth path: Geneva (2026) → Zurich + Basel (2027) → Brussels + Vienna (2028) → white-label API for event platforms (2029)", 34, 450, { size: 10, color: C.white, width: W - 80, lineGap: 3 });
text("The reuse library creates a network effect: each new event adds inventory that lowers cost for the next event, increasing platform stickiness.", 34, 470, { size: 8.5, color: "#86efac", width: W - 80 });

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — The Platform
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("The Platform", "Production-ready full-stack application — built and deployed");

// Left: feature list
const features = [
  { icon: "🔐", title: "OAuth Sign-in", desc: "Google & Apple — zero-friction onboarding for organisers and volunteers" },
  { icon: "📋", title: "Role-based Onboarding", desc: "New users fill tailored forms (volunteer or organiser) — data informs personalised comms" },
  { icon: "📍", title: "GPS Check-in", desc: "Mobile-optimised location confirmation with accuracy reporting" },
  { icon: "📸", title: "Photo Documentation", desc: "Batch photography with grade, material and count linked to each upload" },
  { icon: "📧", title: "Automated Emails", desc: "7 trigger-based notification types: welcome, event confirmed, check-in, role changed, deposit reminder, certificate" },
  { icon: "🛡️", title: "Role-based Access Control", desc: "Volunteer · Organiser · Admin dashboards with Supabase RLS at the database layer" },
  { icon: "📊", title: "Admin Impact Dashboard", desc: "Real-time stats: user count, events, check-ins, CO₂ estimated, deposit flow" },
];
features.forEach(({ icon, title, desc }, i) => {
  const fy = 86 + i * 57;
  rect(20, fy, 370, 50, i % 2 === 0 ? C.bg : C.white, 6);
  text(icon, 30, fy + 14, { size: 16 });
  text(title, 56, fy + 10, { size: 9.5, color: C.text, font: "Helvetica-Bold" });
  text(desc, 56, fy + 24, { size: 8.5, color: C.muted, width: 322, lineGap: 1 });
});

// Right: tech stack + status
rect(410, 86, W - 430, 400, C.dark, 10);
text("Tech Stack", 426, 100, { size: 11, color: C.white, font: "Helvetica-Bold" });

const stack = [
  ["Next.js 15", "React server components + API routes"],
  ["Supabase", "Postgres + Auth + Storage + RLS"],
  ["@supabase/ssr", "Cookie-based auth on server components"],
  ["Vercel", "Edge deployment, preview branches, env vars"],
  ["Resend", "Transactional email API (7 templates)"],
  ["Zod", "Runtime schema validation on all inputs"],
];
stack.forEach(([name, desc], i) => {
  rect(422, 118 + i * 40, W - 450, 32, "#1e293b", 6);
  text(name, 432, 124 + i * 40, { size: 9, color: C.greenMid, font: "Helvetica-Bold" });
  text(desc, 432, 137 + i * 40, { size: 8, color: "#94a3b8" });
});

// Status badges
const badges = [
  ["✓ Deployed on Vercel", C.green],
  ["✓ Auth working", C.green],
  ["✓ DB schema + RLS", C.green],
  ["✓ Email templates ready", C.green],
  ["⏳ Resend API key needed", C.amber],
  ["⏳ Pilot event data", C.amber],
];
text("Status", 426, 370, { size: 10, color: C.white, font: "Helvetica-Bold" });
badges.forEach(([label, color], i) => {
  const bx = 422 + (i % 2) * 185;
  const by = 386 + Math.floor(i / 2) * 22;
  rect(bx, by, 175, 16, color === C.green ? "#14532d" : "#451a03", 4);
  text(label, bx + 6, by + 3, { size: 8, color: color === C.green ? "#86efac" : "#fde68a" });
});

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Business Model
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("Business Model", "Multiple revenue streams from a single circular transaction");

// Revenue streams
const streams = [
  {
    n: "01", title: "Deposit Processing Fee",
    amount: "CHF 0.20", unit: "per lanyard documented",
    desc: "Retained from every lanyard recorded on the platform. Covers logistics coordination and platform operation.",
    color: C.green, light: C.greenLight,
  },
  {
    n: "02", title: "Reuse Library Rental",
    amount: "CHF 1.50", unit: "per lanyard rented out",
    desc: "Grade A/B lanyards enter the library and are rented to future organisers at 80% discount vs new production.",
    color: C.blue, light: C.blueLight,
  },
  {
    n: "03", title: "Impact Certificates",
    amount: "CHF 200–500", unit: "per event (branded PDF)",
    desc: "Premium branded sustainability certificates with CO₂ data, photo evidence, and SDG alignment for ESG reports.",
    color: "#7c3aed", light: "#ede9fe",
  },
  {
    n: "04", title: "White-label Licensing",
    amount: "CHF 5 K / yr", unit: "per city / region",
    desc: "License the platform to other cities or event management companies. API + dashboard + brand kit.",
    color: C.amber, light: C.amberLight,
  },
];
streams.forEach(({ n, title, amount, unit, desc, color, light }, i) => {
  const sx = 20 + (i % 2) * 402;
  const sy = 90 + Math.floor(i / 2) * 116;
  rect(sx, sy, 386, 106, light, 8);
  rect(sx, sy, 50, 106, color, 8);
  rect(sx + 38, sy, 12, 106, color); // extend color rect cleanly
  text(n, sx + 14, sy + 38, { size: 16, color: C.white, font: "Helvetica-Bold" });
  text(title, sx + 58, sy + 12, { size: 11, color: C.text, font: "Helvetica-Bold", width: 314 });
  text(amount, sx + 58, sy + 30, { size: 18, color, font: "Helvetica-Bold" });
  text(unit, sx + 58, sy + 52, { size: 9, color: C.muted, width: 314 });
  text(desc, sx + 58, sy + 66, { size: 8.5, color: C.muted, width: 314, lineGap: 1.5 });
});

// Scenario table
rect(20, 332, W - 40, 104, C.dark, 8);
text("Revenue Scenarios", 34, 342, { size: 10, color: C.white, font: "Helvetica-Bold" });

const scenarios = [
  { name: "Pilot 2026", events: "10 events", lanyards: "8,000", proc: "CHF 1,600", lib: "CHF 3,000", cert: "CHF 2,000", total: "CHF 6,600" },
  { name: "Growth 2027", events: "60 events", lanyards: "48,000", proc: "CHF 9,600", lib: "CHF 18,000", cert: "CHF 12,000", total: "CHF 39,600" },
  { name: "Scale 2028", events: "200 events", lanyards: "200,000", proc: "CHF 40,000", lib: "CHF 75,000", cert: "CHF 40,000", total: "CHF 155,000+" },
];
const cols7 = ["Scenario", "Events", "Lanyards", "Processing", "Library", "Certs", "Total Rev."];
cols7.forEach((c, i) => {
  text(c, 34 + i * 114, 360, { size: 8, color: C.faint, font: "Helvetica-Bold" });
});
line(34, 374, W - 34, 374, "#334155", 0.5);
scenarios.forEach(({ name, events, lanyards, proc, lib, cert, total }, ri) => {
  const values = [name, events, lanyards, proc, lib, cert, total];
  const bg = ri === 0 ? "#1e293b" : "transparent";
  if (bg !== "transparent") rect(34, 378 + ri * 20, W - 68, 18, bg, 4);
  values.forEach((v, ci) => {
    text(v, 34 + ci * 114, 382 + ri * 20, {
      size: 8.5,
      color: ci === 6 ? C.greenMid : ci === 0 ? C.white : "#94a3b8"
    });
  });
});

// Breakeven note
rect(20, 447, W - 40, 42, C.greenLight, 8);
text("Path to break-even: 40 events (~32,000 lanyards) with CHF 150K seed investment. Marginal cost per lanyard drops 60% once the reuse library reaches 5,000 items.", 34, 456, { size: 9.5, color: C.greenDark, width: W - 80, lineGap: 3 });

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Impact
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("Impact", "Environmental, social and economic returns that compound with scale");

// Impact stat grid
const impacts = [
  { val: "12.5 kg", lbl: "CO₂ avoided", sub: "per 500-lanyard event\nvs virgin polyester production", color: C.greenLight, vc: C.green },
  { val: "3,750 kg", lbl: "CO₂/yr by 2027", sub: "at 60 events with\n500 avg lanyards", color: C.greenLight, vc: C.green },
  { val: "CHF 4,000", lbl: "material value saved", sub: "per 500-lanyard event\nat CHF 8 cost/unit", color: C.blueLight, vc: C.blue },
  { val: "0", lbl: "lanyards to landfill", sub: "every lanyard exits\nwith a documented destination", color: C.amberLight, vc: C.amber },
];
const impW = (W - 80) / 4;
impacts.forEach(({ val, lbl, sub, color, vc }, i) => {
  statCard(20 + i * (impW + 13), 86, impW, 110, val, lbl, sub, color, vc);
});

// SDG alignment
rect(20, 212, 380, 170, C.bg, 8);
text("UN Sustainable Development Goals", 34, 222, { size: 10, color: C.text, font: "Helvetica-Bold" });
const sdgs = [
  { n: "SDG 12", label: "Responsible Consumption & Production", icon: "♻️" },
  { n: "SDG 13", label: "Climate Action — CO₂ reduction", icon: "🌡" },
  { n: "SDG 11", label: "Sustainable Cities & Communities", icon: "🏙" },
  { n: "SDG 17", label: "Partnerships for the Goals", icon: "🤝" },
];
sdgs.forEach(({ n, label, icon }, i) => {
  rect(32, 240 + i * 36, 354, 28, C.white, 6);
  text(icon, 38, 247 + i * 36, { size: 14 });
  text(n, 58, 244 + i * 36, { size: 9, color: C.green, font: "Helvetica-Bold" });
  text(label, 58, 256 + i * 36, { size: 8.5, color: C.muted });
});

// Community / karma economy
rect(416, 212, W - 436, 170, C.dark, 8);
text("Volunteer Karma Economy 🌿", 430, 222, { size: 10, color: C.white, font: "Helvetica-Bold" });
const karma = [
  ["10 pts", "1 lanyard collected & documented"],
  ["100 pts", "Free community event ticket"],
  ["500 pts", "Geneva tram day-pass"],
  ["1,000 pts", "Partner NGO membership"],
];
karma.forEach(([pts, reward], i) => {
  rect(428, 240 + i * 36, W - 454, 28, "#1e293b", 6);
  text(pts, 438, 247 + i * 36, { size: 11, color: C.greenMid, font: "Helvetica-Bold", width: 70 });
  text(reward, 508, 250 + i * 36, { size: 8.5, color: "#94a3b8", width: W - 540 });
});

// ISO / standards alignment
rect(20, 394, W - 40, 48, C.blueLight, 8);
text("Standards & Certifications Supported", 34, 404, { size: 10, color: C.blue, font: "Helvetica-Bold" });
const stds = ["ISO 20121 — Sustainable Events", "GHG Protocol Scope 3", "CDP Supply Chain Reporting", "EU Green Claims Directive", "Swiss BAFU Environmental Reporting"];
stds.forEach((s, i) => {
  text("✓  " + s, 34 + i * 158, 420, { size: 8, color: C.blue, width: 154 });
});

// Scalability note
rect(20, 452, W - 40, 38, C.greenLight, 8);
text("Network effect: each event adds to the reuse library. More inventory → lower cost per lanyard → more organisers choose LémanLoop → more volunteers → bigger library. The loop accelerates.", 34, 460, { size: 9, color: C.greenDark, width: W - 80, lineGap: 2.5 });

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — The Ask
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
slideHeader("What We Are Looking For", "Three ways to be part of LémanLoop from day one");

// Three partnership tracks
const asks = [
  {
    icon: "🏢", label: "Pilot Event Partner",
    color: C.blue, light: C.blueLight,
    what: "Register your next Geneva event on LémanLoop",
    offer: [
      "Zero deposit for pilot events (we absorb the cost)",
      "Free branded impact certificate",
      "PR story and co-branding opportunity",
      "Direct influence on platform features",
      "Listed as a founding partner",
    ],
    ideal: "UN agencies, NGOs, corporates, Geneva conference venues",
  },
  {
    icon: "🌐", label: "Strategic Partner",
    color: C.green, light: C.greenLight,
    what: "Help us build the volunteer network and library",
    offer: [
      "Volunteer programme integration (CSR days)",
      "Joint grant applications (Swiss Climate Fund, EU LIFE)",
      "Co-branded reuse library at your premises",
      "Impact data for your own sustainability reporting",
      "Advisory board seat",
    ],
    ideal: "Foundations, municipalities, universities, green NGOs",
  },
  {
    icon: "💡", label: "Seed Investor",
    color: "#7c3aed", light: "#ede9fe",
    what: "CHF 150,000 to launch and scale the loop",
    offer: [
      "40% Volunteer coordination + training programme",
      "30% Reuse library infrastructure + storage",
      "20% Platform features + mobile app",
      "10% Marketing, partnerships, PR",
      "Equity stake negotiable (5–12%)",
    ],
    ideal: "Impact investors, family offices, green tech VCs",
  },
];

asks.forEach(({ icon, label, color, light, what, offer, ideal }, i) => {
  const ax = 20 + i * 274;
  rect(ax, 86, 258, 348, light, 10);
  rect(ax, 86, 258, 48, color, 10); rect(ax, 116, 258, 18, color);
  text(icon + "  " + label, ax + 14, 96, { size: 12, color: C.white, font: "Helvetica-Bold", width: 230 });
  text(what, ax + 14, 144, { size: 9, color: C.text, font: "Helvetica-Bold", width: 230, lineGap: 2 });
  offer.forEach((o, j) => {
    circle(ax + 22, 172 + j * 44, 3, color);
    text(o, ax + 30, 165 + j * 44, { size: 8.5, color: C.text, width: 225, lineGap: 1 });
  });
  rect(ax + 10, 354, 238, 66, C.white, 6);
  text("Ideal for:", ax + 20, 360, { size: 8, color: C.muted, font: "Helvetica-Bold" });
  text(ideal, ax + 20, 372, { size: 8.5, color: C.text, width: 220, lineGap: 2 });
});

// Timeline
rect(20, 445, W - 40, 48, C.dark, 8);
text("Roadmap", 34, 455, { size: 9, color: C.faint, font: "Helvetica-Bold" });
const milestones = [
  ["Q1 2026", "Seed raise & 3 pilot events"],
  ["Q2 2026", "Reuse library live + 50 volunteers"],
  ["Q3 2026", "First certificates issued"],
  ["Q4 2026", "Zurich + Lausanne expansion"],
  ["2027", "White-label v1 + EU pilots"],
];
milestones.forEach(([q, m], i) => {
  circle(34 + i * 157, 468, 5, C.green);
  text(q, 22 + i * 157, 476, { size: 8, color: C.greenMid, font: "Helvetica-Bold", width: 150 });
  text(m, 22 + i * 157, 487, { size: 7.5, color: "#94a3b8", width: 148, lineGap: 1 });
  if (i < 4) line(39 + i * 157, 468, 29 + (i + 1) * 157, 468, C.green, 1);
});

text("LémanLoop · Confidential · February 2026", 0, H - 20, { size: 8, color: C.faint, align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Contact / CTA
// ══════════════════════════════════════════════════════════════════════════

doc.addPage({ size: [W, H], margin: 0 });
rect(0, 0, W, H, C.dark);
rect(0, 0, W, H / 2.4, C.green);

// Top section
circle(W / 2, 60, 32, C.greenDark);
text("🌿", W / 2 - 14, 44, { size: 28 });

doc.save().fillColor(C.white).font("Helvetica-Bold").fontSize(32)
   .text("Let's close the loop together.", 0, 102, { align: "center", width: W });
doc.restore();
doc.save().fillColor("#bbf7d0").font("Helvetica").fontSize(13)
   .text("Join LémanLoop as a pilot partner, strategic ally, or seed investor.", 0, 142, { align: "center", width: W });
doc.restore();

// Divider
line(W / 2 - 60, 172, W / 2 + 60, 172, "#4ade80", 1);

// Contact info cards
const contacts = [
  { icon: "🌐", label: "Platform", val: "lemanloop.ch" },
  { icon: "📧", label: "Email", val: "info@lemanloop.ch" },
  { icon: "📍", label: "Base", val: "Geneva, Switzerland" },
];
contacts.forEach(({ icon, label, val }, i) => {
  const cx = W / 2 - 255 + i * 170;
  rect(cx, 188, 155, 58, "#1e293b", 8);
  text(icon + "  " + label, cx + 12, 196, { size: 9, color: C.faint, font: "Helvetica-Bold" });
  text(val, cx + 12, 212, { size: 10.5, color: C.white, font: "Helvetica-Bold" });
});

// SDG / mission statement
rect(W / 2 - 240, 262, 480, 80, "#0f1923", 10);
text(
  "\"Every conference lanyard is a reusable resource. LémanLoop makes\ncircularity the path of least resistance for organizers and volunteers alike.\"\n\nMission: Zero lanyard to landfill by 2028 in the Lake Geneva region.",
  W / 2 - 220, 272,
  { size: 9.5, color: "#94a3b8", align: "center", width: 440, lineGap: 4 }
);

// Supporting logos / tags
const tags2 = ["🇺🇳 UN Agenda 2030", "♻️ Circular Economy", "🌿 SDG 12 + 13", "🇨🇭 Swiss Made"];
tags2.forEach((t, i) => {
  const tx = W / 2 - 300 + i * 150;
  rect(tx, 360, 138, 24, "#1e293b", 6);
  text(t, tx + 8, 366, { size: 8.5, color: "#64748b" });
});

// Bottom note
text("This document is confidential and intended solely for the named recipient. All financial projections are estimates.", 0, H - 38, { size: 7.5, color: "#334155", align: "center", width: W });
text("LémanLoop · Geneva · February 2026 · lemanloop.ch", 0, H - 24, { size: 8, color: "#475569", align: "center", width: W });

// ── Finalise ────────────────────────────────────────────────────────────
doc.end();
console.log("✓ PDF generated:", OUT);
