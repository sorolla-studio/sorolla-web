"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteContent } from "@/content/site";

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 bg-background py-4 px-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={siteContent.logo.src}
            alt={siteContent.logo.alt}
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </Link>
        <div className="flex gap-8">
          {siteContent.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground hover:underline underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
