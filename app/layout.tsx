import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/app/components/layout/ClientLayout";
import { Providers } from "@/app/components/layout/Providers";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_TITLE_TEMPLATE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_ALT,
  OG_LOCALE,
  OG_TYPE,
  TWITTER_CARD,
  TWITTER_CREATOR,
  TWITTER_SITE,
} from "@/config/seo.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050608",
};

export const metadata: Metadata = {
  // ── Titles ──────────────────────────────────────────────
  title: {
    default: SITE_TITLE_DEFAULT,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,

  // ── Canonical & alternate ──────────────────────────────
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // ── Icons ──────────────────────────────────────────────
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },

  // ── Open Graph ─────────────────────────────────────────
  openGraph: {
    type: OG_TYPE as "website",
    locale: OG_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },

  // ── Twitter ────────────────────────────────────────────
  twitter: {
    card: TWITTER_CARD,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    site: TWITTER_SITE,
    creator: TWITTER_CREATOR,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },

  // ── Robots ─────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Application metadata ───────────────────────────────
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: "Belsterns",
  publisher: "Belsterns",
  category: "Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* GEO: llms.txt discovery for AI/LLM crawlers */}
        <link rel="alternate" type="text/plain" title="LLM-readable site description" href="/llms.txt" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-[#0a1628] min-h-screen text-white relative`}
        suppressHydrationWarning
      >
        {/* Global solid background color */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#0a1628]" />

        <div className="relative z-10">
          <Providers>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Providers>
        </div>
      </body>
    </html>
  );
}
