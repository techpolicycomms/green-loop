import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use Â· LÃ©manLoop",
  description: "Terms governing your use of the LÃ©manLoop platform."
};

const LAST_UPDATED = "23 February 2026";

export default function TermsPage() {
  return (
    <main>
      <div style={{ maxWidth: 720 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Legal
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            Terms of Use
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.75 }}>

          <PolicySection title="1. Acceptance">
            <p>
              By creating an account or using the LÃ©manLoop platform (&ldquo;Platform&rdquo;), you agree to these Terms of Use. If you do not agree, please do not use the Platform. These terms are governed by Swiss law.
            </p>
          </PolicySection>

          <PolicySection title="2. Eligibility">
            <p>You must be at least 16 years old to use the Platform. By registering, you confirm that you meet this requirement.</p>
          </PolicySection>

          <PolicySection title="3. Volunteer responsibilities">
            <ul>
              <li>Attend approved events on time and carry out lanyard collection in good faith.</li>
              <li>Grade lanyards honestly (A / B / C) according to the guidelines provided on the Platform.</li>
              <li>Submit accurate GPS check-in data. Do not manipulate or falsify location or grade records.</li>
              <li>Treat event attendees and organisers with courtesy.</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Organiser responsibilities">
            <ul>
              <li>Provide accurate event information (name, location, date, expected lanyard count).</li>
              <li>Pay the applicable deposit (CHF 2 per expected lanyard) before the event date.</li>
              <li>Ensure a safe collection environment for volunteers at your venue.</li>
              <li>Notify LÃ©manLoop promptly if an event is cancelled or rescheduled.</li>
            </ul>
          </PolicySection>

          <PolicySection title="5. Deposit and refund">
            <p>
              Organisers pay a deposit of CHF 2 per lanyard when registering an event. The deposit is refunded for each lanyard returned in Grade A or B condition, less any applicable processing fees. Grade C lanyards are routed to upcycling partners and are not eligible for a refund. Disputes about grades must be raised within 14 days of the event.
            </p>
          </PolicySection>

          <PolicySection title="6. Karma points">
            <p>
              Karma points are awarded to volunteers as a non-monetary recognition of their contribution. They have no cash value, are not transferable, and may not be sold. LÃ©manLoop reserves the right to adjust the karma programme with reasonable notice.
            </p>
          </PolicySection>

          <PolicySection title="7. Prohibited conduct">
            <p>You must not:</p>
            <ul>
              <li>Submit false, misleading, or fabricated data (check-ins, grades, photos).</li>
              <li>Use the Platform for any unlawful purpose.</li>
              <li>Attempt to access accounts, data, or systems you are not authorised to access.</li>
              <li>Reproduce, scrape, or resell any part of the Platform without written permission.</li>
              <li>Harass, threaten, or discriminate against other users.</li>
            </ul>
            <p>Violations may result in immediate account suspension and, where applicable, legal action.</p>
          </PolicySection>

          <PolicySection title="8. Intellectual property">
            <p>
              All content, design, and software on the Platform is owned by or licensed to LÃ©manLoop and protected by Swiss and international copyright law. You may not reproduce, distribute, or create derivative works without prior written consent.
            </p>
          </PolicySection>

          <PolicySection title="9. Disclaimer of warranties">
            <p>
              The Platform is provided &ldquo;as is&rdquo;. LÃ©manLoop makes no warranties, express or implied, regarding availability, accuracy, or fitness for a particular purpose. We do not guarantee that the Platform will be error-free or uninterrupted.
            </p>
          </PolicySection>

          <PolicySection title="10. Limitation of liability">
            <p>
              To the fullest extent permitted by Swiss law, LÃ©manLoop shall not be liable for indirect, incidental, or consequential damages arising from your use of (or inability to use) the Platform. Our total liability for direct damages shall not exceed CHF 100 or the amount you paid us in the 12 months prior to the claim, whichever is greater.
            </p>
          </PolicySection>

          <PolicySection title="11. Changes to these terms">
            <p>
              We may update these terms from time to time. Material changes will be communicated via the Platform at least 14 days before they take effect. Continued use after that date constitutes acceptance of the revised terms.
            </p>
          </PolicySection>

          <PolicySection title="12. Governing law and jurisdiction">
            <p>
              These terms are governed by Swiss law. Any dispute shall be subject to the exclusive jurisdiction of the courts of Geneva, Switzerland, unless mandatory consumer protection law in your country of residence provides otherwise.
            </p>
          </PolicySection>

          <PolicySection title="13. Contact">
            <p>
              LÃ©manLoop Â· Geneva, Switzerland<br />
              <a href="mailto:hello@lemanloop.ch">hello@lemanloop.ch</a>
            </p>
          </PolicySection>

        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--color-border)", display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>â Home</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Privacy policy</Link>
        </div>

      </div>
    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 12px", paddingBottom: 8, borderBottom: "1px solid var(--color-border)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
