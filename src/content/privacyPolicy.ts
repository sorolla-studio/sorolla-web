import { siteContent } from "./site";

export type Inline = string | { text: string; href: string };
export type TextBlock = { type: "paragraph"; content: Inline[] };
export type ListBlock = { type: "list"; items: Inline[][] };
export type PolicyBlock = TextBlock | ListBlock;

const emailLink = { text: siteContent.contactEmail, href: `mailto:${siteContent.contactEmail}` };

export const privacyPolicyContent = {
  metadata: {
    title: "Sorolla Privacy Policy",
    description:
      "Privacy policy for Sorolla mobile games. Covers data collection, third-party services, and your rights under GDPR and CCPA.",
  },
  title: "Sorolla Privacy Policy",
  lastUpdated: "March 10, 2026",
  introduction: [
    "This privacy policy applies to all mobile games developed and published by Sorolla on the Google Play Store and the Apple App Store. By using any of our games, you agree to the practices described in this policy.",
  ],
  sections: [
    {
      title: "Data Collection and Use",
      blocks: [
        { type: "paragraph", content: ["Our games use third-party services to provide advertisements and analyze user interactions. These services help us:"] },
        {
          type: "list",
          items: [
            ["Deliver ads that support the game's development and keep it free to play."],
            ["Understand how users interact with our games to improve the experience."],
          ],
        },
        {
          type: "paragraph",
          content: ["We do not collect or store any personal data directly. However, our third-party partners may collect and process data as described below."],
        },
      ],
    },
    {
      title: "Third-Party Services",
      blocks: [
        { type: "paragraph", content: ["We use the following third-party services, which may collect data:"] },
        {
          type: "list",
          items: [
            ["AppLovin MAX: Used for ad mediation and serving advertisements in our games. ", { text: "AppLovin Privacy Policy", href: "https://www.applovin.com/privacy/" }],
            ["Adjust: Used for attribution and marketing analytics. ", { text: "Adjust Privacy Policy", href: "https://www.adjust.com/terms/privacy-policy/" }],
            ["Firebase: Used for analytics and crash reporting. ", { text: "Firebase Privacy Policy", href: "https://firebase.google.com/support/privacy" }],
            ["GameAnalytics: Used for gameplay analytics. ", { text: "GameAnalytics Privacy Policy", href: "https://gameanalytics.com/privacy/" }],
            ["Meta: Used for analytics and ad optimization. ", { text: "Meta Privacy Policy", href: "https://www.facebook.com/privacy/policy/" }],
          ],
        },
      ],
    },
    {
      title: "Data We Collect",
      blocks: [
        { type: "paragraph", content: ["While we do not collect or store personal data ourselves, our third-party partners may collect the following types of data:"] },
        {
          type: "list",
          items: [
            ["Device Information: Device type, operating system, unique device identifiers."],
            ["Usage Data: How you interact with the game, such as levels completed and time spent."],
            ["Ad Interaction Data: How you engage with ads, such as clicks and views."],
            ["Location Data: Approximate location, such as country, for ad targeting if enabled."],
          ],
        },
        { type: "paragraph", content: ["This data is used by our partners for:"] },
        {
          type: "list",
          items: [
            ["Serving personalized advertisements."],
            ["Measuring ad performance."],
            ["Analyzing game usage to enhance features."],
          ],
        },
      ],
    },
    {
      title: "Data Retention",
      blocks: [
        { type: "paragraph", content: ["User data collected by our third-party partners is removed when no activity is detected for a continuous period of 25 months, or upon receiving a valid deletion request. Each partner may have their own retention policies as described in their respective privacy policies."] },
      ],
    },
    {
      title: "Data Deletion",
      blocks: [
        { type: "paragraph", content: ["To request deletion of your data, you can contact us at ", emailLink, " and we will coordinate with our partners on your behalf."] },
        { type: "paragraph", content: ["You may also contact our third-party partners directly:"] },
        {
          type: "list",
          items: [
            ["AppLovin: Email ", { text: "dataprotection@applovin.com", href: "mailto:dataprotection@applovin.com" }],
            ["Adjust: Email ", { text: "privacy@adjust.com", href: "mailto:privacy@adjust.com" }, " or use their ", { text: "Forget Device tool", href: "https://www.adjust.com/forget-device/" }],
            ["Firebase: Manage your data through your ", { text: "Google Account settings", href: "https://myaccount.google.com/data-and-privacy" }],
            ["GameAnalytics: Email ", { text: "privacy@gameanalytics.com", href: "mailto:privacy@gameanalytics.com" }],
            ["Meta: Use their ", { text: "Privacy Support", href: "https://www.facebook.com/help/contact/567360226613199" }],
          ],
        },
      ],
    },
    {
      title: "Children's Privacy",
      blocks: [
        { type: "paragraph", content: ["Our games are not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16. If you are a parent or guardian and believe your child has provided personal data, please contact us at ", emailLink, " so we can take appropriate action."] },
      ],
    },
    {
      title: "International Data Transfers",
      blocks: [
        { type: "paragraph", content: ["Data collected by our third-party partners may be transferred to and processed in countries outside the European Economic Area (EEA), including the United States. Our partners implement appropriate safeguards as required by applicable data protection laws to ensure your data remains protected."] },
      ],
    },
    {
      title: "Compliance with Privacy Laws",
      blocks: [
        { type: "paragraph", content: ["We comply with applicable privacy laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). If you are a resident of the European Economic Area (EEA) or California, you have rights such as accessing, correcting, or deleting your data. To exercise these rights, please contact us at ", emailLink, "."] },
      ],
    },
    {
      title: "Changes to This Policy",
      blocks: [
        { type: "paragraph", content: ["We may update this privacy policy from time to time. Any changes will be posted on this page with an updated Last Updated date. We encourage you to review this policy periodically."] },
      ],
    },
    {
      title: "Contact Us",
      blocks: [
        { type: "paragraph", content: ["If you have any questions about this privacy policy, please contact us at ", emailLink] },
      ],
    },
  ],
} satisfies {
  metadata: { title: string; description: string };
  title: string;
  lastUpdated: string;
  introduction: string[];
  sections: { title: string; blocks: PolicyBlock[] }[];
};
