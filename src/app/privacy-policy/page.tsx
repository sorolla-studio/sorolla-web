import type { Metadata } from "next";
import Link from "next/link";
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
            className="text-brand underline hover:no-underline"
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
      <ul className="list-disc list-inside text-foreground/80 mb-4 space-y-2">
        {block.items.map((item, index) => (
          <li key={index}>
            <InlineContent content={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-foreground/80 mb-4">
      <InlineContent content={block.content} />
    </p>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          {privacyPolicyContent.title}
        </h1>
        <p className="text-foreground/60 italic mb-12">
          Last Updated: {privacyPolicyContent.lastUpdated}
        </p>

        <section className="mb-12">
          {privacyPolicyContent.introduction.map((paragraph) => (
            <p key={paragraph} className="text-foreground/80">
              {paragraph}
            </p>
          ))}
        </section>

        {privacyPolicyContent.sections.map((section) => (
          <section key={section.title} className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {section.title}
            </h2>
            {section.blocks.map((block, index) => (
              <PolicyBlockView key={`${section.title}-${index}`} block={block} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
