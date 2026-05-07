import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { aboutContent } from "@/content/about";

export const metadata: Metadata = aboutContent.metadata;

export default function AboutPage() {
  return (
    <div>
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {aboutContent.hero.title}
            </h1>
            <p className="text-lg text-foreground/80 leading-relaxed">
              {aboutContent.hero.bodyPrefix}
              <strong>{aboutContent.hero.strongText}</strong>
              {aboutContent.hero.bodySuffix}
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src={aboutContent.hero.image.src}
              alt={aboutContent.hero.image.alt}
              width={aboutContent.hero.image.width}
              height={aboutContent.hero.image.height}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-coral py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {aboutContent.contact.title}
            </h2>
            <p className="text-white/90 text-lg">{aboutContent.contact.body}</p>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
