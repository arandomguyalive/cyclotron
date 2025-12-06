"use client";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";
import { SonicProvider } from "@/lib/SonicContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata and Viewport are not client-side concepts, they should remain as is
// if possible, or moved to a layout.tsx parent if it needs to be server rendered.
// For now, I'll keep them as is and assume Next.js handles it.
// If not, I'll address it in the next iteration.

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cyber-black text-cyber-white overflow-x-hidden selection:bg-cyber-blue selection:text-cyber-black`}
      >
        <SonicProvider>
          <main className="min-h-screen pb-20 relative z-0">
            {children}
          </main>
          <BottomNav />
        </SonicProvider>
      </body>
    </html>
  );
}
