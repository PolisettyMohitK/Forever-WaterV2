import type { Metadata } from "next";
import { Playfair_Display, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

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
  title: "Forever Water — Premium Branded Water",
  description:
    "Custom-branded glass water bottles for restaurants, hotels, and events. Designed to extend your space, not interrupt it.",
  openGraph: {
    title: "Forever Water — Premium Branded Water",
    description: "Custom-branded glass water bottles for restaurants, hotels, and events.",
    type: "website",
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
      className={`${playfair.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full bg-ink text-paper">{children}</body>
    </html>
  );
}
