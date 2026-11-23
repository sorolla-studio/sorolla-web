import Link from "next/link";
import Logo from "./Logo";
import { siteContent } from "@/content/site";

export default function Header({ over = false }: { over?: boolean }) {
  return (
    <header className={over ? "site-header is-over" : "site-header"}>
      <Link href="/" className="brand"><Logo /><span>{siteContent.companyName}</span></Link>
      <nav aria-label="Main">
        {siteContent.nav.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
      </nav>
    </header>
  );
}
