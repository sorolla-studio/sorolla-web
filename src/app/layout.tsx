import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "./globals.css";
import { siteContent } from "@/content/site";

const text = Gabarito({ variable: "--font-gabarito", subsets: ["latin"] });

const isProduction = process.env.CONTEXT === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteContent.url),
  title: siteContent.metadata.title,
  description: siteContent.metadata.description,
  robots: isProduction ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={text.variable}>
      <body>{children}</body>
    </html>
  );
}
