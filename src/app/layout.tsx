import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Idea One",
  description: "GreenLoop MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
