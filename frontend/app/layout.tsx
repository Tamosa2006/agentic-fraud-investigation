import type { Metadata } from "next";

import "./globals.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const metadata: Metadata = {
  title: "Fraud Intelligence Agent",
  description:
    "Agentic fraud investigation platform powered by Gemini and TigerGraph",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>

        <div className="app-shell">

          <Sidebar />

          <main className="main-area">

            <Topbar />

            <div className="page-content">
              {children}
            </div>

          </main>

        </div>

      </body>

    </html>
  );
}