import Link from "next/link";
import Sea from "@/components/Sea";
import Header from "@/components/Header";
import Read from "@/components/Read";
import Games from "@/components/Games";
import Work from "@/components/Work";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { homeContent } from "@/content/home";

export default function Home() {
  const { hero } = homeContent;
  return (
    <>
      <main>
        <section className="hero">
          <h1 className="sr-only">Sorolla. {hero.title}.</h1>
          <Sea words={hero.sea}><Header over /></Sea>
          <div className="hero-line">
            <p>{hero.line}</p>
            <Link href="#contact" className="button">{hero.button}</Link>
          </div>
        </section>
        <Read />
        <Games />
        <Work />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
