import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/app/components/layout/ClientLayout";
import { Providers } from "@/app/components/layout/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EZTest - Test Management Made Simple",
    template: "%s | EZTest"
  },
  description: "Lightweight, powerful test management platform that runs on minimal hardware. Perfect for teams who want control without complexity.",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a1628] min-h-screen text-white relative`}
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
