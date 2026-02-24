"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { IconLeaf, IconCheckCircle } from "@/components/Icons";

const GITHUB_REPO = "https://github.com/techpolicycomms/green-loop";
const STRIPE_SUPPORT_5 = "https://buy.stripe.com/fZu8wP2qO7bd0yR6uA6sw00";
const STRIPE_BOARD_MEMBER = "https://buy.stripe.com/5kQ6oH8Pc7bddlD7yE6sw01";

export default function AboutPage() {
  const [photoError, setPhotoError] = useState(false);

  return (
    <main>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{
        padding: "56px 32px 60px",
        background: "linear-gradient(160deg, var(--color-accent-soft) 0%, var(--color-bg) 70%)",
        borderRadius: "var(--radius-xl)",
        marginBottom: 56,
        textAlign: "center"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ color: "var(--color-primary)", display: "block" }}><IconLeaf /></span>
        </div>
        <h1 style={{
          fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)",
          fontWeight: 700,
          color: "var(--color-text)",
          letterSpacing: "-0.03em",
          margin: "0 auto 16px",
          maxWidth: 620,
          lineHeight: 1.15
        }}>
          Building Geneva&apos;s circular economy, together
        </h1>
        <p style={{ fontSize: "1.05rem", color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto 24px", lineHeight: 1.7 }}>
          LémanLoop is a not-for-profit, community-owned initiative. We believe sustainability works best
          when it&apos;s open, shared, and rooted in the communities it serves.
        </p>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 auto 24px" }}>
          <strong>Open source.</strong> Fork, adapt, or contribute:{" "}
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline" }}>
            github.com/techpolicycomms/green-loop
          </a>
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {["Not for profit", "Community owned", "Open source", "Open science"].map((tag) => (
            tag === "Open source" ? (
              <a key={tag} href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" style={{
                padding: "6px 16px", fontSize: 13, fontWeight: 600,
                borderRadius: "var(--radius-full)",
                background: "var(--color-primary)", color: "#fff", textDecoration: "none"
              }}>{tag}</a>
            ) : (
              <span key={tag} style={{
                padding: "6px 16px", fontSize: 13, fontWeight: 600,
                borderRadius: "var(--radius-full)",
                background: "var(--color-primary)", color: "#fff"
              }}>{tag}</span>
            )
          ))}
        </div>
      </section>

      {/* ── Founding story ────────────────────────────────────────────── */}
      <section style={{ marginBottom: 64, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="about-two-col">
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            How it started
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 16px", lineHeight: 1.2 }}>
            A lanyard problem hiding in plain sight
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.75, margin: "0 0 14px" }}>
            Every Geneva conference ends the same way: thousands of lanyards tossed in a bin. After one too many events
            watching perfectly reusable lanyards head to landfill, Rahul Jha set out to close that loop.
          </p>
          <p style={{ fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.75, margin: "0 0 14px" }}>
            The idea was simple: a deposit-and-return system, volunteer-powered collection, and an open platform
            that any event organiser or community member could contribute to. No shareholder interests.
            No proprietary lock-in. Just a shared commons for a shared problem.
          </p>
          <p style={{ fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.75, margin: 0 }}>
            LémanLoop is structured as a not-for-profit association under Swiss law, with community governance
            baked in from day one. Every contributor — volunteer, organiser, or donor — is a co-owner of the mission.
          </p>
        </div>

        {/* ── Team ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
          {/* Rahul Jha — Founder */}
          <div className="card" style={{ padding: "32px 28px", maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              margin: "0 auto 16px",
              border: "3px solid var(--color-primary)",
              overflow: "hidden",
              background: "var(--color-accent-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative"
            }}>
              {!photoError && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/team/rahul-jha.png"
                  alt="Rahul Jha"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", position: "absolute", inset: 0 }}
                  onError={() => setPhotoError(true)}
                />
              )}
              {photoError && (
                <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-primary)" }}>RJ</span>
              )}
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>Rahul Jha</h3>
            <p style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, margin: "0 0 16px" }}>Founder</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.65, margin: "0 0 16px" }}>
              Programme Manager at UN/ITU Geneva, 13+ years across climate action, digital transformation, and business process engineering. Leads ITU&apos;s Environmental Management System targeting 45% GHG reduction. Built LémanLoop to close the loop on event lanyard waste in Geneva&apos;s dense international conference calendar.
            </p>
            <a href="mailto:rahul@lemanloop.ch" style={{ fontSize: 12, color: "var(--color-text-muted)", textDecoration: "none", padding: "5px 14px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>Get in touch</a>
          </div>

          {/* Renate Günther — Advisor */}
          <div className="card" style={{ padding: "24px 28px", maxWidth: 420, width: "100%", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>Renate Günther</h3>
            <p style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, margin: "0 0 12px" }}>Advisor</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0 }}>
              Co-Founder & VP of Geneva Macro Labs, a think-and-do tank for the UN SDGs. Background in strategic partnerships and business development at The Economist, POLITICO, Reuters, and Deutsche Börse. Multilingual (DE/EN/FR/IT). Brings fundraising, media, and SDG-alignment expertise.
            </p>
          </div>

          {/* Dr. Jörn Erbguth — Advisor */}
          <div className="card" style={{ padding: "24px 28px", maxWidth: 420, width: "100%", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>Dr. Jörn Erbguth</h3>
            <p style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, margin: "0 0 12px" }}>Advisor</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0 }}>
              Head of Technology Insights at Geneva Macro Labs. Dual PhD in computer science and law; specialist in blockchain governance, GDPR, smart contracts, and AI. Lecturer at University of Geneva and University of Lucerne. Has presented research at the UN in Geneva.
            </p>
          </div>

          {/* Supporting institutions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", marginTop: 16, paddingTop: 24, borderTop: "1px solid var(--color-border)", width: "100%", maxWidth: 420 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted-2)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Supporting institutions</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0, textAlign: "center" }}>
              <a href="https://ge-ni.ch" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>ge-ni.ch</a> — Geneva Network of Innovators, connecting change-makers across International Geneva to build responsible innovation commons
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0, textAlign: "center" }}>
              <strong>Geneva Macro Labs</strong> — Innovation hub and DO TANK driving multi-stakeholder solutions for the SDGs
            </p>
            <a href="https://ge-ni.ch" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none" }} title="ge-ni Geneva Network of Innovators">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/team/ge-ni-logo.png" alt="ge-ni Geneva Network of Innovators" style={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain" }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Our model ─────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 64 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
          Our model
        </p>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 8px", textAlign: "center" }}>
          Open by design. Community by choice.
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", textAlign: "center", margin: "0 auto 36px", maxWidth: 520, lineHeight: 1.65 }}>
          LémanLoop is built on four commitments that are written into how we govern and operate.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            {
              title: "Not for profit",
              text: "We are structured as a Swiss association (à but non lucratif). Any financial surplus is reinvested directly into the programme — expanded coverage, better tooling, or lanyard library growth. No shareholder ever benefits."
            },
            {
              title: "Community ownership",
              text: "Volunteers, organisers, and donors who contribute to LémanLoop are co-owners of the mission. Governance decisions are made openly, with proposals and votes accessible to all members."
            },
            {
              title: "Open source",
              text: "The entire LémanLoop platform — from the grading algorithm to the CO₂ calculation model — is published under an open licence. Fork it, adapt it, or run your own loop in another city."
            },
            {
              title: "Open science",
              text: "Our impact data, lanyard grade distributions, CO₂ savings methodologies, and research findings are published openly. Good environmental data should be a public good, not a proprietary asset."
            }
          ].map((p) => (
            <div key={p.title} className="card" style={{ padding: "24px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: "var(--color-primary)", flexShrink: 0 }}><IconCheckCircle /></span>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>{p.title}</h3>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.7 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Donate ────────────────────────────────────────────────────── */}
      <section
        id="donate"
        style={{
          padding: "48px 40px",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
          borderRadius: "var(--radius-xl)",
          marginBottom: 56,
          color: "#fff",
          textAlign: "center"
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.75, marginBottom: 12 }}>
          Support the mission
        </p>
        <h2 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 auto 16px", maxWidth: 520, lineHeight: 1.2, color: "#fff" }}>
          Help the loop keep growing
        </h2>
        <p style={{ fontSize: 15, opacity: 0.88, maxWidth: 520, margin: "0 auto 12px", lineHeight: 1.7 }}>
          LémanLoop runs on volunteer energy and community generosity. Donations fund lanyard library expansion,
          volunteer training, platform development, and our open science data publishing.
        </p>
        <p style={{ fontSize: 13, opacity: 0.72, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Every franc stays in the programme. As a not-for-profit association we publish our accounts annually.
        </p>

        {/* Donation CTAs — primary (low barrier) first, then secondary (high commitment) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <a
            href={STRIPE_SUPPORT_5}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 36px",
              background: "#fff",
              color: "var(--color-primary-hover)",
              fontWeight: 700,
              fontSize: 16,
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              transition: "transform 0.18s, box-shadow 0.18s"
            }}
          >
            ♡ Support with CHF 5
          </a>
          <a
            href={STRIPE_BOARD_MEMBER}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              border: "2px solid rgba(255,255,255,0.5)",
              transition: "background 0.2s, border-color 0.2s"
            }}
          >
            Become a board member (CHF 1,000)
          </a>
        </div>

        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
          Secure payment via Stripe · No account required · One-time or recurring
        </p>
      </section>

      {/* ── Get involved ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 20px" }}>
          Get involved
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <GetInvolvedCard
            title="Volunteer"
            desc="Collect and grade lanyards at Geneva events. Earn karma points."
            href="/volunteer"
            cta="Start volunteering"
          />
          <GetInvolvedCard
            title="Register an event"
            desc="Pay the deposit, attract volunteers, receive an impact certificate."
            href="/organizer"
            cta="Register your event"
          />
          <GetInvolvedCard
            title="Donate"
            desc="Support the programme financially. Every franc is reinvested."
            href={STRIPE_SUPPORT_5}
            cta="Donate now"
            external
          />
          <GetInvolvedCard
            title="Contribute code"
            desc="LémanLoop is open source. Fork, open a PR, report a bug, or suggest a feature."
            href={GITHUB_REPO}
            cta="View on GitHub"
            external
          />
        </div>
      </section>

      {/* Footer nav */}
      <div style={{ paddingTop: 24, borderTop: "1px solid var(--color-border)", display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Home</Link>
        <Link href="/privacy" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Privacy policy</Link>
        <Link href="/terms" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Terms of use</Link>
      </div>

    </main>
  );
}

const cardStyle: React.CSSProperties = {
  display: "block", textDecoration: "none", color: "inherit", padding: "22px 20px"
};

function GetInvolvedCard({
  title, desc, href, cta, external
}: {
  title: string; desc: string; href: string; cta: string; external?: boolean;
}) {
  const inner = (
    <>
      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>{desc}</p>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>{cta} →</span>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="card" style={cardStyle}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="card" style={cardStyle}>
      {inner}
    </Link>
  );
}
