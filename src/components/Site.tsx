import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/site";

function Mark() {
  return <Image src="/logo/mark.webp" alt="" width={163} height={176} unoptimized loading="eager" className="brand-mark" />;
}

export function SiteHeader({ over = false }: { over?: boolean }) {
  return (
    <header className={over ? "site-header is-over" : "site-header"}>
      <Link href="/" className="brand" aria-label={siteContent.companyName}><Mark /><span className="brand-name" /></Link>
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
        <Link href="/" className="brand" aria-label={siteContent.companyName}><Mark /></Link>
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
