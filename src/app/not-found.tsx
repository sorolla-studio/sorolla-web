import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="band about">
          <h1>Nothing here but water</h1>
          <div>
            <p>This page does not exist. The sea is on the front page, and so is everything else.</p>
            <p><Link href="/" className="button">Back to the front page</Link></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
