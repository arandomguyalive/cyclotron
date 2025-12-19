import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'), // Replace with actual domain
  title: {
    default: "ABHED: Join the Blacklist - Secure, Sovereign, Exclusive",
    template: "%s | ABHED Blacklist",
  },
  description: "Secure your digital existence with KM18's ABHED Blacklist. Experience unparalleled privacy, forensic protection, and exclusive access. Only 500 spots available.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ABHED Blacklist",
  },
  openGraph: {
    title: "ABHED: Join the Blacklist - Secure, Sovereign, Exclusive",
    description: "Secure your digital existence with KM18's ABHED Blacklist. Experience unparalleled privacy, forensic protection, and exclusive access. Only 500 spots available.",
    url: "https://your-domain.com/upgrade", // Replace with upgrade page URL
    siteName: "ABHED Blacklist",
    images: [
      {
        url: "https://your-domain.com/og-image.jpg", // Placeholder for actual OG image
        width: 1200,
        height: 630,
        alt: "ABHED Blacklist: Secure Your Existence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ABHED: Join the Blacklist - Secure, Sovereign, Exclusive",
    description: "Secure your digital existence with KM18's ABHED Blacklist. Experience unparalleled privacy, forensic protection, and exclusive access. Only 500 spots available.",
    creator: "@KM18Official", // Replace with actual Twitter handle
    images: ["https://your-domain.com/og-image.jpg"], // Placeholder for actual OG image
  },
};

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary-bg text-primary-text overflow-x-hidden selection:bg-accent-1 selection:text-primary-bg`}
      >
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
