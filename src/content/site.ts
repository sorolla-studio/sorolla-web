export const siteContent = {
  companyName: "Sorolla",
  tagline: "Just Play",
  contactEmail: "contact@sorolla.io",
  copyrightYear: "2026",
  logo: {
    src: "/images/logo.png",
    alt: "Sorolla",
  },
  metadata: {
    title: {
      default: "Sorolla | Discover Artistic Inspiration Today",
      template: "%s — Sorolla",
    },
    description:
      "Explore Sorolla | Just Play for engaging arts content, vibrant visuals, and creative ideas to inspire your next artistic project or visit.",
  },
  nav: [
    { label: "About us", href: "/about" },
    { label: "Sorolla Privacy Policy", href: "/privacy-policy" },
  ],
  footer: {
    privacyLabel: "Privacy",
  },
} as const;
