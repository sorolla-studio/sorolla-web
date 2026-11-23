import Image from "next/image";
import Link from "next/link";
import Sea from "@/components/Sea";
import { SiteFooter, SiteHeader } from "@/components/Site";
import Read from "@/components/Read";
import Games from "@/components/Games";
import Contact from "@/components/Contact";
import { homeContent } from "@/content/home";

export default function Home() {
  const { hero, work } = homeContent;
  return (
    <>
      <main>
        <section className="hero">
          <h1 className="sr-only">Sorolla. {hero.title}.</h1>
          <Sea words={hero.sea}><SiteHeader over /></Sea>
          <div className="hero-line">
            <p>{hero.line}</p>
            <Link href="#contact" className="button">{hero.button}</Link>
          </div>
        </section>
        <Read />
        <Games />
        <section id="work" className="work">
          <div className="band"><h2>{work.title}</h2></div>
          <div className="day"><Image src="/paint/day.webp" alt="One painted sea, from noon on the left to night on the right" width={2000} height={620} sizes="100vw" /></div>
          <ol className="steps">
            {work.steps.map((s) => <li key={s.name}><span className="step-light" aria-hidden="true" /><h3>{s.name}</h3><p>{s.body}</p></li>)}
          </ol>
        </section>
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
