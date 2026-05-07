export const aboutContent = {
  metadata: {
    title: "About us | Partner with Sorolla Today",
    description:
      "Learn about Sorolla's mission to transform game ideas into worldwide successes through collaboration, development, and scaling of hybrid casual titles.",
  },
  hero: {
    title: "Who we are",
    bodyPrefix: "At ",
    strongText: "Sorolla",
    bodySuffix: ", we help great game ideas become global hits. We work hand-in-hand with game creators to develop, test, and scale hybrid casual titles with long-term revenue potential.",
    image: {
      src: "/images/about-device.png",
      alt: "Smartphone device mockup",
      width: 400,
      height: 500,
    },
  },
  contact: {
    title: "Contact us",
    body: "Want to work with us? Fill out the form and we will get back to you!",
  },
} as const;

export const aboutContactFormContent = {
  successMessage: "Thank you! We'll get back to you soon.",
  emailLabel: "Email",
  messageLabel: "Message",
  submitLabel: "SEND",
  honeypotLabel: "Don't fill this out if you're human:",
} as const;
