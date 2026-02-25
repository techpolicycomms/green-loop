import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import Script from "next/script";

export const metadata: Metadata = {
  title: "LémanLoop",
  description: "LémanLoop — Geneva's circular lanyard programme. Reuse, return, reimagine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en">
      <body>
        {/* Zoho PageSense — heatmaps, session recordings, visitor feedback */}
        <Script
          src="https://cdn.pagesense.io/js/greenloop/c1f9888b3ed648a5bc422f8cff06cadc.js"
          strategy="afterInteractive"
        />
        {/* Google Analytics 4 — set NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX in Vercel env vars */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}
        <SkipLink />
        <Nav />
        <div id="main-content" role="main" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 48px" }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
