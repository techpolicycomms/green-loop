import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "GreenLoop",
  description: "GreenLoop MVP - Volunteer & event management"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 48px" }}>{children}</div>
      </body>
    </html>
  );
}
