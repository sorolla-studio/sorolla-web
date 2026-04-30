"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 bg-background py-4 px-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Sorolla"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </Link>
        <div className="flex gap-8">
          <Link
            href="/about"
            className="text-foreground hover:underline underline-offset-4"
          >
            About us
          </Link>
          <Link
            href="/privacy-policy"
            className="text-foreground hover:underline underline-offset-4"
          >
            Sorolla Privacy Policy
          </Link>
        </div>
      </nav>
    </header>
  );
}
