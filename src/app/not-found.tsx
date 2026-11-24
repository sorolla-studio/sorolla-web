import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/Site";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="band about">
          <h1>Nothing here but water</h1>
          <div>
            <p>This page does not exist. The sea is on the front page, and so is everything else.</p>
            <p><Link href="/" className="button">Back to the front page</Link></p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
