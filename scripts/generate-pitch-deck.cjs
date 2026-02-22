/**
 * LémanLoop Pitch Deck — PDF Generator (v2, DejaVu fonts, no emoji)
 * Run: node scripts/generate-pitch-deck.cjs
 * Output: LémanLoop-PitchDeck-2026.pdf
 */

const PDFDocument = require("pdfkit");
const fs   = require("fs");
const path = require("path");

// ── Fonts ──────────────────────────────────────────────────────────────────
const FONT_DIR  = "/usr/share/fonts/truetype/dejavu";
const F  = {
  reg:  path.join(FONT_DIR, "DejaVuSans.ttf"),
  bold: path.join(FONT_DIR, "DejaVuSans-Bold.ttf"),
  mono: path.join(FONT_DIR, "DejaVuSansMono.ttf"),
};

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  green:      "#15803d",
  greenDark:  "#14532d",
  greenMid:   "#22c55e",
  greenLight: "#dcfce7",
  white:      "#ffffff",
  dark:       "#0f1923",
  text:       "#1a2332",
  muted:      "#64748b",
  faint:      "#94a3b8",
  bg:         "#f8fafc",
  border:     "#e2e8f0",
  blue:       "#1d4ed8",
  blueLight:  "#dbeafe",
  amber:      "#d97706",
  amberLight: "#fef3c7",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  purple:     "#7c3aed",
  purpleLight:"#ede9fe",
  slate:      "#334155",
};

// A4 landscape
const W = 841.89;
const H = 595.28;

const doc = new PDFDocument({
  size: [W, H], margin: 0,
  info: {
    Title:   "LémanLoop — Investor Pitch Deck 2026",
    Author:  "LémanLoop",
    Subject: "Circular Lanyard Economy · Geneva",
  }
});

const OUT = path.join(__dirname, "..", "LémanLoop-PitchDeck-2026.pdf");
doc.pipe(fs.createWriteStream(OUT));

// ── Low-level helpers ──────────────────────────────────────────────────────
function r(x, y, w, h, color, radius = 0) {
  doc.save();
  (radius > 0 ? doc.roundedRect(x, y, w, h, radius) : doc.rect(x, y, w, h)).fill(color);
  doc.restore();
}
function t(str, x, y, { size=11, color=C.text, bold=false, align="left", width, lineGap=2, opacity=1 }={}) {
  doc.save().fillColor(color).font(bold ? F.bold : F.reg).fontSize(size).fillOpacity(opacity);
  const o = { align, lineGap };
  if (width) o.width = width;
  doc.text(String(str), x, y, o);
  doc.restore();
}
function circ(x, y, radius, color) {
  doc.save().circle(x, y, radius).fill(color).restore();
}
function ln(x1, y1, x2, y2, color, w=1) {
  doc.save().moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(w).stroke().restore();
}
function tri(x, y, color) {   // right-pointing triangle (arrow head)
  doc.save().fillColor(color)
     .moveTo(x, y).lineTo(x+13, y+6).lineTo(x, y+12).closePath().fill();
  doc.restore();
}

// Slide background + left accent strip
function bg(headerColor = C.green) {
  r(0, 0, W, H, C.bg);
  r(0, 0, 5, H, headerColor);
}

// Standard slide header bar (green block left + slide number right)
let slideNum = 0;
function header(title, subtitle="") {
  slideNum++;
  r(0, 0, W, 70, C.white);
  ln(0, 70, W, 70, C.border, 0.5);
  r(5, 0, 305, 70, C.green);
  t("LémanLoop", 20, 10, { size:10, color: "#86efac" });
  t(title, 20, 25, { size:19, color: C.white, bold:true });
  if (subtitle) t(subtitle, 20, 50, { size:8, color: "#86efac" });
  t(`${slideNum} / 10`, W - 55, 28, { size: 9, color: C.faint });
}

function footer() {
  t("LémanLoop  ·  Confidential  ·  February 2026", 0, H - 18, { size:7.5, color: C.faint, align:"center", width: W });
}

function statCard(x, y, w, h, val, lbl, sub, bg_=C.greenLight, vc=C.green) {
  r(x, y, w, h, bg_, 8);
  t(val, x+12, y+12, { size:20, color:vc, bold:true, width:w-24 });
  t(lbl, x+12, y+40, { size:9.5, color:C.text, bold:true, width:w-24 });
  if (sub) t(sub, x+12, y+55, { size:8, color:C.muted, width:w-24, lineGap:1.5 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ══════════════════════════════════════════════════════════════════════════
slideNum = 0;  // header() will increment to 1 on first call, cover is manual

r(0, 0, W, H, C.dark);
r(0, 0, 365, H, C.green);

// Monogram badge
circ(182, 96, 44, C.greenDark);
t("LL", 157, 74, { size:36, color:C.greenLight, bold:true });

// Brand
t("LémanLoop", 30, 158, { size:38, color:C.white, bold:true });
t("Closing the conference lanyard loop", 30, 204, { size:14, color:"#86efac" });
t("A deposit-backed circular economy for event lanyards", 30, 228, { size:10.5, color:"#bbf7d0" });
t("in Geneva and beyond", 30, 244, { size:10.5, color:"#bbf7d0" });

ln(30, 280, 335, 280, "#4ade80", 0.8);

t("Geneva, Switzerland", 30, 292, { size:10, color:"#86efac" });
t("Pitch Deck  ·  February 2026", 30, 308, { size:9, color:"#4ade80" });
t("CONFIDENTIAL", 30, 324, { size:8.5, color:"#22c55e", bold:true });

// Right panel
t("THE PROBLEM", 400, 115, { size:9, color:C.faint, bold:true });
t("Millions of lanyards", 400, 132, { size:22, color:C.white, bold:true, width:430 });
t("discarded every year.", 400, 160, { size:22, color:C.white, bold:true, width:430 });

ln(400, 204, W-20, 204, "#334155", 0.5);

t("OUR ANSWER", 400, 218, { size:9, color:C.faint, bold:true });
t("Organisers pay a CHF 2 refundable deposit per lanyard.", 400, 236, { size:10.5, color:"#94a3b8", width:420, lineGap:3 });
t("Volunteers collect, grade (A/B/C), and photograph batches.", 400, 256, { size:10.5, color:"#94a3b8", width:420, lineGap:3 });
t("Lanyards return to a circular library. Zero to landfill.", 400, 276, { size:10.5, color:"#94a3b8", width:420, lineGap:3 });

ln(400, 314, W-20, 314, "#334155", 0.5);

// Three stat tiles
const tiles = [
  ["CHF 2", "deposit / lanyard"],
  ["150+", "Geneva events / yr"],
  ["25 g CO2", "per lanyard produced"],
];
tiles.forEach(([val, lbl], i) => {
  const px = 400 + i * 148;
  r(px, 328, 138, 58, "#1e293b", 6);
  t(val, px+10, px > 640 ? 338 : 338, { size:14, color:C.greenMid, bold:true });
  t(lbl, px+10, 358, { size:8, color:C.faint, width:118, lineGap:1 });
});

t("lemanloop.ch  ·  info@lemanloop.ch", 400, 424, { size:9, color:"#475569" });

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Problem
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("The Problem", "Single-use lanyards are a hidden waste crisis at every conference");

t("Every year, hundreds of millions of conference lanyards are produced from virgin polyester, worn once, and thrown away. In Geneva alone — home to the UN, WHO, WEF, ICRC and 150+ international events — this represents an enormous and completely avoidable waste stream.",
  20, 84, { size:10, color:C.text, width:W-40, lineGap:3 });

const s2 = [
  ["500 M+", "lanyards produced\nglobally each year", "at conferences, expos & events",C.redLight, C.red],
  ["95%", "end up in landfill\nwithin 48 hours", "of the event closing", C.amberLight, C.amber],
  ["CHF 8+", "average cost per\nnew lanyard", "materials, printing & logistics", C.blueLight, C.blue],
  ["25 g CO2", "per lanyard\nproduced", "from virgin polyester", C.greenLight, C.green],
];
const cw2 = (W-80)/4;
s2.forEach(([val,lbl,sub,bg_,vc], i) => statCard(20+i*(cw2+13), 132, cw2, 108, val, lbl, sub, bg_, vc));

// Geneva context
r(20, 254, W-40, 100, C.dark, 8);
t("Switzerland / Geneva Context", 36, 263, { size:10.5, color:C.greenMid, bold:true });
["150+ major international conferences annually (UN, WEF, IAEA, ICRC, WHO, ITU and more)",
 "Average 800 lanyards per event → over 120,000 lanyards per year in Geneva alone, nearly all discarded",
 "Growing ESG mandates from organisers — but no scalable circular solution has existed until now",
 "Lake Geneva region has one of the highest event densities in Europe — the ideal pilot territory",
].forEach((f, i) => {
  circ(36, 286+i*16, 2.5, C.greenMid);
  t(f, 45, 281+i*16, { size:8.5, color:"#cbd5e1", width:W-80 });
});

// Quote
r(20, 366, W-40, 48, C.greenLight, 8);
t('"There is no reason a lanyard that cost CHF 8 to produce and was worn for 3 hours should go straight to landfill. LémanLoop makes circularity the obvious, frictionless choice."',
  34, 376, { size:9.5, color:C.greenDark, width:W-80 });

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — The Solution
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("The Solution", "A deposit-backed circular economy for conference lanyards");

const cols3 = [
  { tag:"ORGANISER", color:C.blue, light:C.blueLight,
    points:["Registers event on LémanLoop platform","Pays CHF 2 refundable deposit per lanyard","Volunteers dispatched to collection points","Receives verified impact certificate post-event","Gets ESG data for annual sustainability report"] },
  { tag:"VOLUNTEER", color:C.green, light:C.greenLight,
    points:["Sees live map of upcoming events","GPS check-in at the collection point","Collects, grades (A / B / C) and photographs batches","Earns karma points for event tickets and rewards","Builds a local sustainability community"] },
  { tag:"THE LANYARD", color:C.purple, light:C.purpleLight,
    points:["Grade A (Excellent) → Reuse library immediately","Grade B (Good) → Cleaned, returned to library","Grade C (Damaged) → Upcycling or material recycling","Every lanyard exits with a documented destination","Library lanyards cost CHF 1.50 vs CHF 8+ new"] },
];
cols3.forEach(({ tag, color, light, points }, i) => {
  const cx = 20 + i*273;
  r(cx, 84, 257, 348, light, 10);
  r(cx, 84, 257, 52, color, 10);
  r(cx, 114, 257, 22, color);
  t(tag, cx+14, 96, { size:12, color:C.white, bold:true });
  points.forEach((p, j) => {
    circ(cx+21, 158+j*48, 3.5, color);
    t(p, cx+31, 150+j*48, { size:9, color:C.text, width:218, lineGap:2 });
  });
});

r(20, 442, W-40, 58, C.dark, 8);
t("LémanLoop creates a closed-loop system where every lanyard has a use, every volunteer earns, every organiser gets proof of impact, and landfill waste drops to zero.",
  34, 452, { size:10, color:C.white, width:W-80, lineGap:3 });
t("No new infrastructure required. Just an app, a refundable deposit, and a community.", 34, 478, { size:9, color:"#86efac", width:W-80 });

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — How It Works
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("How It Works", "Six steps that close the loop — from event to reuse library");

const steps4 = [
  { n:1, title:"Register Event",      desc:"Organiser logs event\n& pays CHF 2/lanyard\ndeposit", color:C.blue },
  { n:2, title:"Volunteers Notified", desc:"Platform alerts local\nvolunteers of the\ncollection opportunity", color:C.blue },
  { n:3, title:"GPS Check-in",        desc:"Volunteer arrives &\nconfirms location via\nmobile app", color:C.green },
  { n:4, title:"Collect & Grade",     desc:"Sorted into A, B, C\nand photographed\nfor verification", color:C.green },
  { n:5, title:"Certificate Issued",  desc:"Organiser receives\nimpact report &\ndeposit refund", color:C.purple },
  { n:6, title:"Reuse Library",       desc:"Grade A/B lanyards\nrented at CHF 1.50\nto next event", color:C.purple },
];
const sw = 125, sy = 130;
steps4.forEach(({ n, title, desc, color }, i) => {
  const sx = 22 + i*(sw+14);
  circ(sx+sw/2, sy+22, 22, color);
  t(String(n), sx+sw/2 - (n>9?10:6), sy+12, { size:18, color:C.white, bold:true });
  t(title, sx, sy+52, { size:9, color:C.text, bold:true, align:"center", width:sw });
  t(desc,  sx, sy+68, { size:7.5, color:C.muted, align:"center", width:sw, lineGap:1.5 });
  if (i<5) tri(sx+sw+1, sy+16, C.border);
});

// Loop arrow
doc.save().moveTo(22, sy+112).lineTo(W-22, sy+112)
   .strokeColor(C.green).lineWidth(1.5).dash(5,{space:3}).stroke();
doc.restore();
t("Loop closed — lanyard re-enters the circular library for the next event", W/2-190, sy+118, { size:8, color:C.green, bold:true });

// Deposit flow
r(20, 268, W-40, 148, C.bg, 8);
ln(20, 268, W-20, 268, C.border, 0.5);
t("Deposit Flow", 32, 278, { size:10, color:C.text, bold:true });

[
  { lbl:"Organiser pays", amt:"CHF 2.00 / lanyard", color:C.blue, x:32 },
  { lbl:"Grade A / B  →  full refund", amt:"CHF 2.00 returned", color:C.green, x:238 },
  { lbl:"Grade C  →  partial refund", amt:"CHF 1.00 returned", color:C.amber, x:444 },
  { lbl:"Platform processing fee", amt:"CHF 0.20 / lanyard", color:C.muted, x:650 },
].forEach(({ lbl, amt, color, x }) => {
  r(x, 298, 178, 62, C.white, 6);
  ln(x, 298, x+178, 298, color, 3);
  t(lbl, x+10, 308, { size:8.5, color:C.text, bold:true });
  t(amt, x+10, 324, { size:11, color, bold:true });
  t("refundable", x+10, 342, { size:7.5, color:C.faint });
});

// Economics
r(20, 426, W-40, 60, C.greenLight, 8);
t("Unit Economics — example: 500-lanyard event", 32, 436, { size:10, color:C.greenDark, bold:true });
["Deposit collected: CHF 1,000","Logistics cost: CHF 90","Refunds (90% A/B rate): CHF 900","Net retained: CHF ~110 + cert fee","CO2 avoided: 12.5 kg"].forEach((e,i) => {
  t("· " + e, 32+i*158, 454, { size:8.5, color:C.greenDark, width:152 });
});

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Market Opportunity
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("Market Opportunity", "Geneva is the ideal launchpad for a global circular economy model");

// TAM/SAM/SOM legend
const markets5 = [
  { lbl:"TAM", full:"Total Addressable Market", val:"CHF 1 B+", desc:"Global conference lanyard\nmarket (production cost)", color:"#f1f5f9", vc:C.slate },
  { lbl:"SAM", full:"Serviceable Addressable Market", val:"CHF 12 M", desc:"European hubs:\nGeneva, Zurich, Brussels, Vienna", color:C.blueLight, vc:C.blue },
  { lbl:"SOM", full:"Serviceable Obtainable Market", val:"CHF 480 K", desc:"Greater Geneva: 240 events\n× 1,000 avg lanyards", color:C.greenLight, vc:C.green },
];
markets5.forEach(({ lbl, full, val, desc, color, vc }, i) => {
  r(22, 88+i*100, 208, 90, color, 8);
  t(lbl, 34, 96+i*100, { size:14, color:vc, bold:true });
  t(full, 34, 113+i*100, { size:7.5, color:C.muted, width:184 });
  t(val, 34, 126+i*100, { size:15, color:vc, bold:true });
  t(desc, 34, 146+i*100, { size:8, color:C.muted, width:184, lineGap:1 });
});

// Concentric circles visual
[70,50,32].forEach((rad, i) => {
  circ(310, 240, rad, [C.border, C.blueLight, C.greenLight][i]);
});
["TAM","SAM","SOM"].forEach((label, i) => {
  t(label, 310 - 14 + (i===0?-4:0), 240 - (i===0?76:i===1?56:38), { size:8, color:[C.slate,C.blue,C.green][i], bold:true });
});

// Tailwinds
r(340, 88, W-360, 348, C.white, 8);
r(340, 88, W-360, 5, C.green);
t("Market Tailwinds", 354, 102, { size:11, color:C.text, bold:true });
[
  ["ESG Mandates",        "ISO 20121 sustainable events standard now required by UN, EU and major corporates. Organisers must document circular credentials."],
  ["Geneva's Density",   "No city of its size hosts more international organisations. 150+ annual events = a ready-made, captive pilot market."],
  ["Circular Policy",    "EU Ecodesign Regulation 2024 and Swiss green procurement push create regulatory tailwinds and first-mover advantage."],
  ["Volunteer Economy",  "Post-pandemic rise in community volunteering. Karma-point models proven by Too Good To Go, Olio, and Ecosia."],
  ["No Competitors",     "First mover in this niche. High switching costs once a reuse library is established; library = the moat."],
].forEach(([title, desc], i) => {
  r(350, 122+i*62, W-374, 54, C.bg, 6);
  t(title, 362, 130+i*62, { size:9.5, color:C.text, bold:true, width:W-400 });
  t(desc, 362, 144+i*62, { size:8.5, color:C.muted, width:W-400, lineGap:1 });
});

r(20, 446, W-40, 52, C.dark, 8);
t("Growth path: Geneva (2026) → Zurich + Basel (2027) → Brussels + Vienna (2028) → white-label API for global event platforms (2029+)", 32, 456, { size:9.5, color:C.white, width:W-80, lineGap:3 });
t("The reuse library creates a network effect: more events = bigger inventory = lower cost per lanyard = more organisers = larger library.", 32, 476, { size:8.5, color:"#86efac", width:W-80 });

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — The Platform
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("The Platform", "Production-ready full-stack application — built and deployed");

[
  ["Role-based Sign-in",       "Google & Apple OAuth. Role-specific onboarding forms on first login."],
  ["Onboarding Forms",         "Volunteer (availability, motivation) and Organiser (org name, event size) profiles captured at registration."],
  ["GPS Check-in",             "Mobile-optimised location confirmation with accuracy reporting and session linking."],
  ["Photo Documentation",      "Batch photography with grade (A/B/C), material type, and count linked to each upload."],
  ["Automated Email Comms",    "7 trigger-based notification types: welcome, event confirmed, check-in, role changed, reminder, deposit, certificate."],
  ["Role-based Access Control","Volunteer · Organiser · Admin dashboards with Supabase Row Level Security at the database layer."],
  ["Admin Impact Dashboard",   "Real-time stats: users, events, check-ins, CO2 estimated, deposit flow, and one-click reminders."],
].forEach(([title, desc], i) => {
  r(20, 84+i*60, 385, 52, i%2===0 ? C.bg : C.white, 6);
  t(title, 34, 91+i*60, { size:9.5, color:C.text, bold:true, width:358 });
  t(desc, 34, 105+i*60, { size:8.5, color:C.muted, width:358, lineGap:1.5 });
});

r(424, 84, W-444, 412, C.dark, 10);
t("Tech Stack", 438, 98, { size:11, color:C.white, bold:true });
[
  ["Next.js 15",       "React server components + edge API routes"],
  ["Supabase",         "Postgres + Auth + Storage + Row Level Security"],
  ["@supabase/ssr",    "Cookie-based auth for server components"],
  ["Vercel",           "Edge deployment, preview branches, env vars"],
  ["Resend API",       "Transactional email (7 templates, all active)"],
  ["Zod",              "Runtime input validation on all API routes"],
].forEach(([name, desc], i) => {
  r(432, 118+i*42, W-452, 34, "#1e293b", 6);
  t(name, 442, 124+i*42, { size:9, color:C.greenMid, bold:true });
  t(desc, 442, 137+i*42, { size:8, color:"#94a3b8" });
});

t("Deployment Status", 438, 380, { size:10, color:C.white, bold:true });
[
  ["✓  Deployed on Vercel", C.green],
  ["✓  OAuth auth working", C.green],
  ["✓  DB schema + RLS live", C.green],
  ["✓  Email templates ready", C.green],
  ["~  Resend key needed",   C.amber],
  ["~  Pilot event data TBD", C.amber],
].forEach(([lbl, color], i) => {
  const bx = 432 + (i%2)*190, by = 396 + Math.floor(i/2)*24;
  r(bx, by, 182, 18, color===C.green ? "#14532d" : "#451a03", 4);
  t(lbl, bx+6, by+3, { size:8, color: color===C.green ? "#86efac" : "#fde68a" });
});

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Business Model
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("Business Model", "Multiple revenue streams from a single circular transaction");

[
  { n:"01", title:"Deposit Processing Fee", amt:"CHF 0.20", unit:"per lanyard documented",
    desc:"Retained from every lanyard recorded on the platform. Covers logistics and platform operation.", color:C.green, light:C.greenLight },
  { n:"02", title:"Reuse Library Rental", amt:"CHF 1.50", unit:"per lanyard rented out",
    desc:"Grade A/B lanyards enter the library and are rented to future organisers at 80% discount vs new.", color:C.blue, light:C.blueLight },
  { n:"03", title:"Impact Certificates", amt:"CHF 200–500", unit:"per event (branded report)",
    desc:"Premium certificates with CO2 data, photo evidence, and SDG alignment for corporate ESG reports.", color:C.purple, light:C.purpleLight },
  { n:"04", title:"White-label Licensing", amt:"CHF 5 K / yr", unit:"per city or region",
    desc:"License the platform to other cities or event companies. Full API + dashboard + brand kit.", color:C.amber, light:C.amberLight },
].forEach(({ n, title, amt, unit, desc, color, light }, i) => {
  const sx = 20+(i%2)*406, sy = 88+Math.floor(i/2)*118;
  r(sx, sy, 390, 108, light, 8);
  r(sx, sy, 52, 108, color, 8);
  r(sx+40, sy, 12, 108, color);
  t(n, sx+14, sy+38, { size:15, color:C.white, bold:true });
  t(title, sx+60, sy+12, { size:11, color:C.text, bold:true, width:315 });
  t(amt,   sx+60, sy+30, { size:18, color, bold:true });
  t(unit,  sx+60, sy+52, { size:9, color:C.muted, width:315 });
  t(desc,  sx+60, sy+66, { size:8.5, color:C.muted, width:315, lineGap:1.5 });
});

// Scenario table
r(20, 334, W-40, 110, C.dark, 8);
t("Revenue Scenarios", 32, 344, { size:10, color:C.white, bold:true });
const cols7 = ["Scenario","Events","Lanyards","Processing","Library","Certificates","Total"];
cols7.forEach((c,i) => t(c, 32+i*116, 362, { size:8, color:C.faint, bold:true }));
ln(32, 377, W-32, 377, "#334155", 0.5);
[
  ["Pilot 2026",  "10 events",  "8,000",   "CHF 1,600", "CHF 3,000",  "CHF 2,000",  "CHF 6,600"],
  ["Growth 2027", "60 events",  "48,000",  "CHF 9,600", "CHF 18,000", "CHF 12,000", "CHF 39,600"],
  ["Scale 2028",  "200 events", "200,000", "CHF 40,000","CHF 75,000", "CHF 40,000", "CHF 155,000+"],
].forEach((row, ri) => {
  if (ri===0) r(32, 381+ri*20, W-64, 18, "#1e293b", 3);
  row.forEach((v,ci) => t(v, 32+ci*116, 385+ri*20, { size:8.5, color: ci===6?C.greenMid : ci===0?C.white : "#94a3b8" }));
});

r(20, 455, W-40, 42, C.greenLight, 8);
t("Break-even at ~40 events (32,000 lanyards) with CHF 150K seed. Marginal cost per lanyard falls 60% once the reuse library reaches 5,000 items.", 32, 464, { size:9.5, color:C.greenDark, width:W-80, lineGap:3 });

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Impact
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("Impact", "Environmental, social and economic returns that compound with scale");

const iw = (W-80)/4;
[
  ["12.5 kg", "CO2 avoided", "per 500-lanyard event\nvs. virgin polyester", C.greenLight, C.green],
  ["3,750 kg", "CO2 saved / yr", "at 60 events ×\n500 avg lanyards", C.greenLight, C.green],
  ["CHF 4,000", "material value saved", "per 500-lanyard event\nat CHF 8 cost/unit", C.blueLight, C.blue],
  ["0", "lanyards to landfill", "every lanyard exits with\na documented destination", C.amberLight, C.amber],
].forEach(([val,lbl,sub,bg_,vc], i) => statCard(20+i*(iw+13), 84, iw, 112, val, lbl, sub, bg_, vc));

// SDG alignment
r(20, 210, 380, 178, C.bg, 8);
t("UN Sustainable Development Goals", 32, 220, { size:10, color:C.text, bold:true });
[
  ["SDG 12", "Responsible Consumption & Production"],
  ["SDG 13", "Climate Action — reducing CO2"],
  ["SDG 11", "Sustainable Cities & Communities"],
  ["SDG 17", "Partnerships for the Goals"],
].forEach(([n, lbl], i) => {
  r(30, 240+i*36, 358, 28, C.white, 6);
  r(30, 240+i*36, 4, 28, C.green);
  t(n,   38, 245+i*36, { size:9.5, color:C.green, bold:true });
  t(lbl, 38, 258+i*36, { size:8.5, color:C.muted });
});

// Karma economy
r(416, 210, W-436, 178, C.dark, 8);
t("Volunteer Karma Economy", 430, 220, { size:10, color:C.white, bold:true });
[["10 pts",    "1 lanyard collected & documented"],
 ["100 pts",   "Free community event ticket"],
 ["500 pts",   "Geneva tram day-pass"],
 ["1,000 pts", "Partner NGO membership"],
].forEach(([pts, reward], i) => {
  r(428, 240+i*36, W-452, 28, "#1e293b", 6);
  t(pts,    438, 247+i*36, { size:11, color:C.greenMid, bold:true, width:74 });
  t(reward, 510, 250+i*36, { size:8.5, color:"#94a3b8", width:W-544 });
});

// Standards
r(20, 398, W-40, 52, C.blueLight, 8);
t("Standards & Certifications Supported", 32, 408, { size:10, color:C.blue, bold:true });
["ISO 20121 — Sustainable Events","GHG Protocol Scope 3","CDP Supply Chain","EU Green Claims Directive","Swiss BAFU Reporting"].forEach((s,i) => {
  t("✓  "+s, 32+i*162, 424, { size:8, color:C.blue, width:156 });
});

r(20, 460, W-40, 36, C.greenLight, 8);
t("Network effect: each new event adds inventory → lower cost per lanyard → more organisers → more volunteers → bigger library. The loop accelerates itself.", 32, 469, { size:9, color:C.greenDark, width:W-80, lineGap:2.5 });

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — The Ask
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
bg(); header("What We Are Looking For", "Three ways to be part of LémanLoop from day one");

[
  { tag:"PILOT PARTNER", color:C.blue, light:C.blueLight,
    what:"Register your next Geneva event on LémanLoop",
    offer:["Zero deposit for pilot events — we absorb the cost","Free branded impact certificate + data report","PR story and co-branding opportunity","Direct influence on product features","Listed as a founding pilot partner"],
    ideal:"UN agencies, NGOs, corporates, Geneva conference venues" },
  { tag:"STRATEGIC ALLY", color:C.green, light:C.greenLight,
    what:"Help us build the volunteer network and library",
    offer:["Volunteer programme integration (CSR / team days)","Joint grant applications (Swiss Climate Fund, EU LIFE)","Co-branded reuse library at your premises","Impact data for your sustainability reporting","Advisory board seat"],
    ideal:"Foundations, municipalities, universities, green NGOs" },
  { tag:"SEED INVESTOR", color:C.purple, light:C.purpleLight,
    what:"CHF 150,000 to launch and scale the loop",
    offer:["40% — Volunteer coordination + training programme","30% — Reuse library infrastructure + storage","20% — Platform features + mobile app","10% — Marketing, partnerships, PR","Equity stake: 5–12% (negotiable)"],
    ideal:"Impact investors, family offices, green-tech VCs" },
].forEach(({ tag, color, light, what, offer, ideal }, i) => {
  const ax = 20+i*275;
  r(ax, 84, 260, 366, light, 10);
  r(ax, 84, 260, 52, color, 10);
  r(ax, 116, 260, 20, color);
  t(tag, ax+14, 94, { size:12, color:C.white, bold:true });
  t(what, ax+14, 146, { size:8.5, color:C.text, bold:true, width:232, lineGap:2 });
  offer.forEach((o, j) => {
    circ(ax+21, 176+j*44, 3.5, color);
    t(o, ax+31, 169+j*44, { size:8.5, color:C.text, width:225, lineGap:1.5 });
  });
  r(ax+10, 362, 242, 76, C.white, 6);
  t("Ideal for:", ax+20, 368, { size:8, color:C.muted, bold:true });
  t(ideal, ax+20, 380, { size:8.5, color:C.text, width:224, lineGap:2 });
});

// Timeline
r(20, 460, W-40, 50, C.dark, 8);
t("Roadmap", 32, 469, { size:9, color:C.faint, bold:true });
[["Q1 2026","Seed raise & 3 pilots"],["Q2 2026","Library live + 50 volunteers"],["Q3 2026","First certificates"],["Q4 2026","Zurich + Lausanne"],["2027","White-label + EU"]].forEach(([q,m],i) => {
  circ(32+i*160, 480, 5, C.green);
  t(q, 19+i*160, 488, { size:8, color:C.greenMid, bold:true, width:150 });
  t(m, 19+i*160, 499, { size:7.5, color:"#94a3b8", width:148, lineGap:1 });
  if (i<4) ln(37+i*160, 480, 27+(i+1)*160, 480, C.green, 1);
});

footer();

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Contact / CTA
// ══════════════════════════════════════════════════════════════════════════
doc.addPage({ size:[W,H], margin:0 });
r(0, 0, W, H, C.dark);
r(0, 0, W, H*0.46, C.green);

// Monogram
circ(W/2, 56, 32, C.greenDark);
t("LL", W/2-21, 38, { size:28, color:C.greenLight, bold:true });

t("Let's close the loop together.", 0, 106, { size:30, color:C.white, bold:true, align:"center", width:W });
t("Join LémanLoop as a pilot partner, strategic ally, or seed investor.", 0, 146, { size:13, color:"#bbf7d0", align:"center", width:W });

ln(W/2-60, 176, W/2+60, 176, "#4ade80", 1);

// Contact cards
[
  { lbl:"Website", val:"lemanloop.ch" },
  { lbl:"Email",   val:"info@lemanloop.ch" },
  { lbl:"Base",    val:"Geneva, Switzerland" },
].forEach(({ lbl, val }, i) => {
  const cx = W/2-262+i*175;
  r(cx, 190, 163, 60, "#1e293b", 8);
  t(lbl, cx+12, 200, { size:9, color:C.faint, bold:true });
  t(val, cx+12, 218, { size:10.5, color:C.white, bold:true });
});

r(W/2-240, 268, 480, 84, "#0f1923", 10);
t('"Every conference lanyard is a reusable resource. LémanLoop makes circularity\nthe path of least resistance for organisers and volunteers alike."\n\nMission: Zero lanyard to landfill by 2028 in the Lake Geneva region.',
  W/2-220, 278, { size:9.5, color:"#94a3b8", align:"center", width:440, lineGap:4 });

["Circular Economy","UN Agenda 2030 SDG 12+13","Swiss Made","Impact Investing"].forEach((t_, i) => {
  const tx = W/2-305+i*154;
  r(tx, 366, 144, 24, "#1e293b", 6);
  t(t_, tx+8, 372, { size:8.5, color:"#64748b" });
});

t("This document is confidential and intended solely for the named recipient. All financial projections are estimates.",
  0, H-38, { size:7.5, color:"#334155", align:"center", width:W });
t("LémanLoop  ·  Geneva  ·  February 2026  ·  lemanloop.ch",
  0, H-24, { size:8, color:"#475569", align:"center", width:W });

// ── Done ──────────────────────────────────────────────────────────────────
doc.end();
console.log("✓  PDF written to:", OUT);
