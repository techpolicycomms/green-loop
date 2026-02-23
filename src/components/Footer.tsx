import Link from "next/link";
import { IconLeaf } from "./Icons";

const STRIPE_DONATE = "https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-surface)",
      marginTop: 80
    }}>
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "40px 20px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 32
      }}>

        {/* Top row: brand + nav columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr repeat(4, auto)",
          gap: "24px 48px",
          alignItems: "start"
        }}
          className="footer-grid"
        >

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: "var(--color-primary)" }}><IconLeaf /></span>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>LémanLoop</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 14px", lineHeight: 1.65, maxWidth: 240 }}>
              Geneva&apos;s circular lanyard programme — community-owned, not for profit, open source.
            </p>
            <a
              href={STRIPE_DONATE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                background: "var(--color-primary)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none"
              }}
            >
              ♡ &nbsp;Donate
            </a>
          </div>

          {/* Programme */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-subtle)", margin: "0 0 12px" }}>Programme</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/volunteer" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Volunteer</Link>
              <Link href="/organizer" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Organise an event</Link>
              <Link href="/onboarding" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Get started</Link>
            </div>
          </div>

          {/* About */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-subtle)", margin: "0 0 12px" }}>About</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/about" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Our mission</Link>
              <Link href="/about#donate" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Support us</Link>
              <a href="https://github.com/lemanloop" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>GitHub</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-subtle)", margin: "0 0 12px" }}>Legal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Privacy policy</Link>
              <Link href="/terms" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Terms of use</Link>
              <Link href="/privacy#cookies" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>Cookie notice</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-subtle)", margin: "0 0 12px" }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="mailto:hello@lemanloop.ch" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>hello@lemanloop.ch</a>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Geneva, Switzerland</span>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--color-border)" }} />

        {/* Bottom row: copyright + legal links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}>
          <p style={{ fontSize: 12, color: "var(--color-text-subtle)", margin: 0 }}>
            © {year} LémanLoop · Not for profit · Geneva, Switzerland
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/about" style={{ fontSize: 12, color: "var(--color-text-subtle)", textDecoration: "none" }}>About</Link>
            <Link href="/privacy" style={{ fontSize: 12, color: "var(--color-text-subtle)", textDecoration: "none" }}>Privacy policy</Link>
            <Link href="/terms" style={{ fontSize: 12, color: "var(--color-text-subtle)", textDecoration: "none" }}>Terms of use</Link>
            <a href="mailto:hello@lemanloop.ch" style={{ fontSize: 12, color: "var(--color-text-subtle)", textDecoration: "none" }}>Contact</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
