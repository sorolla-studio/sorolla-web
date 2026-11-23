import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { aboutContent } from "@/content/about";

export const metadata: Metadata = aboutContent.metadata;

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="band about">
          <h1>{aboutContent.title}</h1>
          <div>{aboutContent.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
