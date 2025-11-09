import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Predik - El futuro tiene precio",
  description:
    "Opera mercados de predicción en BNB Chain, impulsados por Myriad Protocol.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Predik - El futuro tiene precio",
    description:
      "Opera mercados de predicción en BNB Chain, impulsados por Myriad Protocol.",
    url: "https://predik.io",
    siteName: "Predik",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Predik - El futuro tiene precio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Predik - El futuro tiene precio",
    description:
      "Opera mercados de predicción en BNB Chain, impulsados por Myriad Protocol.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
