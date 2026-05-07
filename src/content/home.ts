export const homeContent = {
  sections: [
    { id: "hero", label: "Index", theme: "dark" },
    { id: "mission", label: "Mission", theme: "light" },
    { id: "process", label: "Process", theme: "dark" },
    { id: "team", label: "Team", theme: "light" },
    { id: "contact", label: "Contact", theme: "light" },
  ],
  hero: {
    eyebrow: "Hybrid casual · est. 2024",
    title: {
      before: "Sorolla ",
      emphasized: "|",
      after: " Just Play",
    },
    image: {
      src: "/images/hero-image.png",
      alt: "A group of happy teenagers and young adults in a gaming arcade, playing games on their smartphones, smiling, laughing, and enjoying their time together.",
    },
    scrollCue: "Scroll",
  },
  mission: {
    eyebrow: "Mission",
    title: {
      before: "We make hybrid casual games",
      emphasized: "worth playing",
      after: ".",
    },
    body: "Sorolla is a small team turning promising prototypes into globally published mobile games. We work behind the scenes — quietly, deliberately, and with a healthy distrust of our own taste.",
    visualLabel: "[ studio photograph ]",
  },
  process: {
    eyebrow: "How we work",
    title: {
      before: "A quiet, ",
      emphasized: "data-driven",
      after: " loop.",
    },
    steps: [
      {
        number: "01",
        label: "Read",
        title: { before: "Read the ", emphasized: "market", after: ", not the room." },
        body: "Hybrid casual rewards instincts most people don't have. We start from market behavior — rankings, retention curves, creative signals — not from what feels good in a meeting.",
      },
      {
        number: "02",
        label: "Test",
        title: { before: "Real spend, ", emphasized: "real users", after: "." },
        body: "Prototypes go through structured UA tests with measurable budgets. CPI, D1, D7, session length, early monetization — the same numbers everyone uses, reported transparently to the studios we work with.",
      },
      {
        number: "03",
        label: "Decide",
        title: { before: "Honest ", emphasized: "thresholds", after: "." },
        body: "We share the numbers as they come in. If a prototype clears, we scale together. If not, we say so quickly and move on. No opaque feedback, no slow no's.",
      },
      {
        number: "04",
        label: "Scale",
        title: { before: "Through to ", emphasized: "live ops", after: "." },
        body: "For winners: SDK integration, creative production, paid UA, monetization tuning, live ops. We treat scaling as part of the product, not an afterthought.",
      },
    ],
  },
  team: {
    eyebrow: "Team",
    title: {
      before: "A few people, working ",
      emphasized: "closely",
      after: ".",
    },
    body: "Sorolla is intentionally small. Decision-makers are reachable; feedback is direct. We treat the studios we work with the way we'd want to be treated as developers.",
    members: [
      {
        name: "Founder",
        role: "CEO",
        initials: "A",
        parallax: "0.15",
        portraitLabel: "[ portrait ]",
        bio: "Background in mobile publishing and product. Leads partnerships, fundraising, and the overall direction of the studio.",
      },
      {
        name: "Co-founder",
        role: "Product & Tech",
        initials: "B",
        parallax: "0.2",
        portraitLabel: "[ portrait ]",
        bio: "Shapes the publishing platform and the SDK. Lives between the analytics pipeline and the studios shipping into it.",
      },
      {
        name: "Co-founder",
        role: "UA & Creative",
        initials: "C",
        parallax: "0.1",
        portraitLabel: "[ portrait ]",
        bio: "Runs the testing loop end-to-end: media buying, creative production, and the read on whether a prototype can scale.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: {
      before: "Tell us what you're ",
      emphasized: "working on",
      after: ".",
    },
    body: "A real human reads every message. We try to reply within a week, even if the answer is no.",
    successTitle: "Thanks — we'll be in touch.",
    successSubtitle: "A real human reads every message.",
    submitLabel: "Send message",
    requiredFields: ["name", "email", "message"],
    reasons: [
      { value: "general", label: "General", placeholder: "Tell us what you have in mind." },
      {
        value: "studio",
        label: "Studio — submit a prototype",
        placeholder: "Tell us about your prototype: genre, build status, anything you've tested so far.",
      },
      { value: "press", label: "Press", placeholder: "What are you working on, and what do you need from us?" },
      { value: "careers", label: "Careers", placeholder: "A short intro plus links to work you're proud of." },
    ],
    fields: {
      reason: "Reason for contact",
      name: "Name",
      email: "Email",
      company: "Studio / company",
      optional: "(optional)",
      message: "Message",
      honeypot: "Don't fill this out:",
    },
  },
} as const;

export type EmphasizedText = {
  before: string;
  emphasized: string;
  after: string;
};
