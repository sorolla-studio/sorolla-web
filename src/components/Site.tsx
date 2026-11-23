import Link from "next/link";
import { siteContent } from "@/content/site";

function Logo({ size = 27 }: { size?: number }) {
  return (
    <svg viewBox="40 36 178 175" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="27" strokeLinecap="round" aria-hidden="true">
      <path d="M190 50H103a49 49 0 0 0 0 98h47" />
      <path d="M109 99h46a49 49 0 0 1 0 98H66" />
    </svg>
  );
}

export function SiteHeader({ over = false }: { over?: boolean }) {
  return (
    <header className={over ? "site-header is-over" : "site-header"}>
      <Link href="/" className="brand"><Logo /><span>{siteContent.companyName}</span></Link>
      <nav aria-label="Main">
        {siteContent.nav.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="site-footer">
        <Link href="/" className="brand is-cyan" aria-label={siteContent.companyName}><Logo size={36} /></Link>
        <p>© {siteContent.copyrightYear} {siteContent.companyName}</p>
        <nav aria-label="Footer">
          {siteContent.footer.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          <a href={`mailto:${siteContent.contactEmail}`}>{siteContent.contactEmail}</a>
        </nav>
      </div>
      <div className="night" aria-hidden="true" />
    </footer>
  );
}
