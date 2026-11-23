import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  privacyPolicyContent,
  type Inline,
  type PolicyBlock,
} from "@/content/privacyPolicy";

export const metadata: Metadata = privacyPolicyContent.metadata;

function InlineContent({ content }: { content: Inline[] }) {
  return (
    <>
      {content.map((part, index) => {
        if (typeof part === "string") return <span key={index}>{part}</span>;

        const isExternal = part.href.startsWith("http");
        return (
          <Link
            key={`${part.href}-${index}`}
            href={part.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {part.text}
          </Link>
        );
      })}
    </>
  );
}

function PolicyBlockView({ block }: { block: PolicyBlock }) {
  if (block.type === "list") {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={index}>
            <InlineContent content={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p>
      <InlineContent content={block.content} />
    </p>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <article className="band legal">
          <h1>{privacyPolicyContent.title}</h1>
          <p className="note">Last updated: {privacyPolicyContent.lastUpdated}</p>
          <section>
            {privacyPolicyContent.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          {privacyPolicyContent.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.blocks.map((block, index) => <PolicyBlockView key={`${section.title}-${index}`} block={block} />)}
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
