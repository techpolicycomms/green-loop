import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · LémanLoop",
  description: "How LémanLoop collects, uses, and protects your personal data in accordance with the Swiss nDSG and the EU GDPR."
};

const LAST_UPDATED = "23 February 2026";
const CONTROLLER = "LémanLoop";
const CONTROLLER_ADDRESS = "Geneva, Switzerland";
const CONTACT_EMAIL = "privacy@lemanloop.ch";

export default function PrivacyPage() {
  return (
    <main>
      <div style={{ maxWidth: 720 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Legal
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="policy-body">

          {/* Introduction */}
          <Section title="1. Who we are">
            <p>
              <strong>{CONTROLLER}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the LémanLoop platform, a circular lanyard programme serving Geneva&rsquo;s event ecosystem. Our registered address is {CONTROLLER_ADDRESS}.
            </p>
            <p>
              We are the data controller for personal data processed through this platform. Questions about this policy or your data rights may be directed to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          {/* Data we collect */}
          <Section title="2. Data we collect">
            <p>We collect only the data necessary to operate the programme:</p>
            <Table rows={[
              ["Account data", "Email address, display name, city, profile photo", "When you create an account or update your profile"],
              ["Role & activity data", "Platform role (volunteer/organiser), event applications, application status", "As you use the platform"],
              ["Operational data", "GPS coordinates at check-in, lanyard grades (A/B/C), material type, quantity, photo of lanyards", "When volunteers perform a collection check-in"],
              ["Event data", "Event name, location, date, estimated lanyard count", "When organisers register events"],
              ["Financial reference data", "Deposit amounts per event (CHF 2/lanyard)", "Calculated at event creation; no payment card data is stored by us"],
              ["Usage data", "Server access logs (IP address, browser type, pages visited, timestamp)", "Automatically, on each request"],
            ]} />
            <p style={{ marginTop: 16 }}>
              We do <strong>not</strong> collect payment card numbers. Any payment processing is handled by a third-party processor subject to their own privacy policy.
            </p>
          </Section>

          {/* Legal basis */}
          <Section title="3. Legal basis for processing">
            <p>We rely on the following legal bases under the Swiss Federal Act on Data Protection (revDSG) and, where applicable, the EU General Data Protection Regulation (GDPR):</p>
            <ul>
              <li><strong>Contract performance</strong> — processing your account and activity data to provide the services you have signed up for.</li>
              <li><strong>Legitimate interests</strong> — server logs for security monitoring and abuse prevention; aggregated impact statistics for environmental reporting.</li>
              <li><strong>Consent</strong> — GPS location data at check-in (you must explicitly trigger a check-in). You may refuse without losing access to other features.</li>
              <li><strong>Legal obligation</strong> — retaining records required by Swiss accounting law (CO Art. 957 et seq.).</li>
            </ul>
          </Section>

          {/* How we use your data */}
          <Section title="4. How we use your data">
            <ul>
              <li>Creating and managing your account</li>
              <li>Matching volunteers with events and tracking application status</li>
              <li>Recording lanyard collection check-ins and computing karma points</li>
              <li>Calculating CO₂ savings and generating verified impact certificates for organisers</li>
              <li>Communicating service-related updates (no marketing emails without separate consent)</li>
              <li>Fraud prevention and platform security</li>
              <li>Aggregate, anonymised reporting on environmental impact (no individual identification)</li>
            </ul>
          </Section>

          {/* Data sharing */}
          <Section title="5. Data sharing and processors">
            <p>We do not sell or rent your personal data. We share data only with:</p>
            <Table rows={[
              ["Supabase Inc.", "Database hosting and authentication (PostgreSQL + Auth)", "EU/US — Standard Contractual Clauses"],
              ["Vercel Inc.", "Platform hosting and edge delivery", "EU/US — Standard Contractual Clauses"],
              ["Upcycling partners", "Anonymised lanyard grade and quantity data only (no personal data)", "Switzerland / EU"],
              ["Authorities", "If required by law, court order, or to protect safety", "As required"],
            ]} />
          </Section>

          {/* Retention */}
          <Section title="6. Data retention">
            <p>We retain personal data only as long as necessary:</p>
            <ul>
              <li><strong>Account data</strong>: until you delete your account, plus 30 days for recovery.</li>
              <li><strong>Operational data</strong> (check-ins, grades): 5 years, to support impact reporting and potential audit requirements.</li>
              <li><strong>Server logs</strong>: 90 days.</li>
              <li><strong>Financial reference data</strong>: 10 years (Swiss CO accounting obligation).</li>
            </ul>
            <p>You may request earlier deletion where no legal retention obligation applies — see Section 7.</p>
          </Section>

          {/* Rights */}
          <Section title="7. Your rights">
            <p>Under the revDSG and GDPR, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — obtain a copy of your personal data.</li>
              <li><strong>Rectification</strong> — correct inaccurate data.</li>
              <li><strong>Erasure</strong> — request deletion of your data (subject to legal retention obligations).</li>
              <li><strong>Restriction</strong> — ask us to pause processing in certain circumstances.</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interests.</li>
              <li><strong>Withdrawal of consent</strong> — withdraw consent (e.g. for GPS check-in) at any time without penalty.</li>
            </ul>
            <p>
              To exercise any right, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond within 30 days. If you are unsatisfied with our response, you may lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC) at <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer">edoeb.admin.ch</a>.
            </p>
          </Section>

          {/* International transfers */}
          <Section title="8. International data transfers">
            <p>
              Your data is stored on servers in the European Union. Any transfer outside Switzerland or the EU is governed by Standard Contractual Clauses (SCCs) approved by the European Commission, which the Swiss FDPIC also recognises as providing adequate protection.
            </p>
          </Section>

          {/* Cookies */}
          <Section title="9. Cookies and local storage" id="cookies">
            <p>We use the following minimal cookies and browser storage:</p>
            <Table rows={[
              ["Session cookie", "sb-* (Supabase)", "Strictly necessary — authenticates your session. Cannot be disabled.", "Session"],
              ["CSRF token", "sb-auth-token", "Strictly necessary — protects against cross-site request forgery.", "Session"],
            ]} headers={["Name", "Set by", "Purpose", "Duration"]} />
            <p style={{ marginTop: 16 }}>
              We do <strong>not</strong> use advertising cookies, third-party tracking pixels, or analytics cookies. We do not serve ads.
            </p>
          </Section>

          {/* Children */}
          <Section title="10. Children's data">
            <p>
              LémanLoop is not directed at children under 16. We do not knowingly collect data from anyone under 16. If you believe a child has provided us with personal data, please contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will delete it promptly.
            </p>
          </Section>

          {/* Security */}
          <Section title="11. Security">
            <p>
              We apply industry-standard safeguards including TLS encryption in transit, AES-256 encryption at rest, row-level security policies on all database tables, and regular security reviews. However, no system is perfectly secure — please use a strong, unique password and contact us immediately if you suspect unauthorised access.
            </p>
          </Section>

          {/* Changes */}
          <Section title="12. Changes to this policy">
            <p>
              We may update this policy to reflect changes in law or our practices. Material changes will be announced on the platform at least 14 days before they take effect. The date at the top of this page indicates when it was last revised.
            </p>
          </Section>

          {/* Contact */}
          <Section title="13. Contact">
            <p>
              Data controller: <strong>{CONTROLLER}</strong><br />
              Address: {CONTROLLER_ADDRESS}<br />
              Privacy enquiries: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>

        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--color-border)", display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Home</Link>
          <Link href="/terms" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Terms of use</Link>
        </div>

      </div>
    </main>
  );
}

// ── Small shared components ────────────────────────────────────────────────

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 12px", paddingBottom: 8, borderBottom: "1px solid var(--color-border)" }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

function Table({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  const cols = headers ?? ["Category", "Data", "When collected"];
  return (
    <div className="table-wrap" style={{ marginTop: 8 }}>
      <table className="data-table" style={{ fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ verticalAlign: "top", paddingTop: 10, paddingBottom: 10 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
