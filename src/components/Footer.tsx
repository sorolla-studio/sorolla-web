import Link from "next/link";
import Logo from "./Logo";
import { siteContent } from "@/content/site";

export default function Footer() {
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
