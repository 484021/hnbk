import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    default: "HNBK — AI Orchestration & Custom Software for SMBs",
    template: "%s | HNBK",
  },
  description:
    "HNBK integrates AI agents and custom software into your business — eliminating manual work, accelerating decisions, and multiplying your team's output.",
  keywords: [
    "AI orchestration",
    "AI agents",
    "custom software",
    "AI integration",
    "business automation",
    "SMB AI",
    "workflow automation",
  ],
  authors: [{ name: "HNBK" }],
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://hnbk.ca",
    siteName: "HNBK",
    title: "HNBK — AI Orchestration & Custom Software for SMBs",
    description:
      "Deploy AI agents that automate complex workflows, eliminate manual work, and scale your operations.",
    images: [
      {
        url: "https://hnbk.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "HNBK — AI Orchestration & Custom Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HNBK — AI Orchestration & Custom Software",
    description:
      "Deploy AI agents that automate complex workflows and scale your operations.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-bg-base text-text-primary flex flex-col min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-brand-purple focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
