import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "LémanLoop",
  description: "LémanLoop — Geneva's circular lanyard programme. Reuse, return, reimagine."
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
