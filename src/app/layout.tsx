import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

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
    url: "https://hnbk.solutions",
    siteName: "HNBK",
    title: "HNBK — AI Orchestration & Custom Software for SMBs",
    description:
      "Deploy AI agents that automate complex workflows, eliminate manual work, and scale your operations.",
    images: [
      {
        url: "https://hnbk.solutions/og-image.png",
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
  alternates: { canonical: "https://hnbk.solutions" },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HNBK",
  url: "https://hnbk.solutions",
  logo: "https://hnbk.solutions/hnbk-logo.png",
  description: "AI orchestration and custom software for Canadian SMBs",
  address: { "@type": "PostalAddress", addressCountry: "CA" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://hnbk.solutions/contact",
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="bg-bg-base text-text-primary flex flex-col min-h-screen">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
