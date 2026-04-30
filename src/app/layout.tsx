import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const isProduction = process.env.CONTEXT === "production";

export const metadata: Metadata = {
  title: {
    default: "Sorolla | Discover Artistic Inspiration Today",
    template: "%s — Sorolla",
  },
  description:
    "Explore Sorolla | Just Play for engaging arts content, vibrant visuals, and creative ideas to inspire your next artistic project or visit.",
  robots: isProduction ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
