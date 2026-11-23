export const siteContent = {
  companyName: "Sorolla",
  tagline: "Just Play",
  contactEmail: "contact@sorolla.io",
  copyrightYear: "2026",
  url: "https://sorolla.io",
  metadata: {
    title: { default: "Sorolla | Just Play", template: "%s | Sorolla" },
    description:
      "Sorolla publishes mobile games. Send us yours: we test it with real players, share the numbers as they come in, and scale the ones that work.",
  },
  nav: [
    { label: "Games", href: "/#games" },
    { label: "How we work", href: "/#work" },
    { label: "About", href: "/about" },
  ],
  footer: [
    { label: "About", href: "/about" },
    { label: "Privacy policy", href: "/privacy-policy" },
  ],
} as const;
