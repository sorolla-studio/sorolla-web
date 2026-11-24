import { siteContent } from "./site";

export type Inline = string | { text: string; href: string };
type TextBlock = { type: "paragraph"; content: Inline[] };
type ListBlock = { type: "list"; items: Inline[][] };
export type PolicyBlock = TextBlock | ListBlock;

const emailLink = { text: siteContent.contactEmail, href: `mailto:${siteContent.contactEmail}` };

export const privacyPolicyContent = {
  metadata: {
    title: "Sorolla Privacy Policy",
    description:
      "How Sorolla's mobile games and website use personal data, the partners involved, children's privacy, and your choices and rights.",
  },
  title: "Sorolla Privacy Policy",
  lastUpdated: "November 24, 2026",
  introduction: [
    "This policy explains how personal data is used in the mobile games Sorolla publishes on the App Store and Google Play, and on this website.",
  ],
  sections: [
    {
      title: "Who we are",
      blocks: [
        { type: "paragraph", content: ["Sorolla publishes mobile games, often made by partner studios. Sorolla decides why and how the personal data described here is used. You can reach us about anything in this policy at ", emailLink, "."] },
      ],
    },
    {
      title: "What our games collect",
      blocks: [
        { type: "paragraph", content: ["Most of what our games use is technical data about your device and how you play. You do not need to give us your name or email address to play. Our games and the tools inside them collect the following, depending on the game:"] },
        {
          type: "list",
          items: [
            ["Device identifiers: the advertising identifier of your device, where your settings allow it, and identifiers created by the game or by our partners, such as a player ID."],
            ["Device information: model, operating system, language, game version, network type and IP address."],
            ["Approximate location: your country or region, usually worked out from your IP address. Our games do not need your precise location."],
            ["Gameplay: sessions, levels, progress and other actions in the game."],
            ["Ads: which ads were shown, watched or tapped, what they earned, and which ad led you to install the game."],
            ["Purchases: the product, price, currency and transaction reference. Apple or Google takes the payment, and we never see your card details."],
            ["Crashes and performance: error reports and the state of the device when they happened."],
          ],
        },
      ],
    },
    {
      title: "Why we use it",
      blocks: [
        { type: "paragraph", content: ["European data protection law asks us to have a legal reason for each use. Ours are listed here."] },
        {
          type: "list",
          items: [
            ["To run the game and keep your progress. Data: device identifiers, device information, gameplay. Legal reason: our contract with you."],
            ["To deliver and check purchases, and keep our accounts. Data: purchases, device identifiers. Legal reason: our contract with you, and our legal duties."],
            ["To understand how the game is played and improve it. Data: gameplay, device identifiers, device information, approximate location. Legal reason: your consent where the law requires it, and otherwise our legitimate interest in improving our games."],
            ["To find and fix crashes. Data: crashes and performance, device information, device identifiers. Legal reason: our legitimate interest in games that work."],
            ["To show ads, which keep most of our games free. Ads can be personalized where the law and your choices allow it. Data: ads, device identifiers, device information, approximate location. Legal reason: your consent where the law requires it, and otherwise our legitimate interest in funding our games."],
            ["To measure our own advertising, for example which campaign led to an install. Data: ads, device identifiers, gameplay, purchases. Legal reason: your consent where the law requires it, and otherwise our legitimate interest in knowing what our advertising brings."],
            ["To prevent fraud and keep our games secure. Data: device identifiers, device information, ads, purchases. Legal reason: our legitimate interest in protecting our games and players."],
            ["To meet legal duties and answer authorities. Data: what the law requires. Legal reason: our legal duties."],
          ],
        },
      ],
    },
    {
      title: "The partners we work with",
      blocks: [
        { type: "paragraph", content: ["Our games use the services below. Third parties, including AppLovin, may collect and process personal data for advertising, and measurement partners may process it too. Not every game uses every service. Some partners also use data for their own purposes, which their own policies explain."] },
        { type: "paragraph", content: ["Advertising:"] },
        {
          type: "list",
          items: [
            ["AppLovin (MAX): shows ads and chooses between ad networks. ", { text: "AppLovin Privacy Policy", href: "https://legal.applovin.com/privacy/" }],
            ["Google (AdMob and Google Ad Manager): shows ads and, where the law requires it, the consent form. ", { text: "How Google uses this data", href: "https://policies.google.com/technologies/partner-sites" }],
            ["Meta (Audience Network and Facebook SDK): shows ads and measures installs from our campaigns. ", { text: "Meta Privacy Policy", href: "https://www.facebook.com/privacy/policy/" }],
            ["Unity Ads: shows ads. ", { text: "Unity Privacy Policy", href: "https://unity.com/legal/game-player-and-app-user-privacy-policy" }],
            ["Liftoff (Vungle): shows ads. ", { text: "Liftoff Privacy Policy", href: "https://liftoff.ai/privacy-policy/" }],
          ],
        },
        { type: "paragraph", content: ["These partners can pass ad requests on to other companies that bid to show you an ad. The companies allowed to sell our ad space are listed in our ", { text: "app-ads.txt file", href: `${siteContent.url}/app-ads.txt` }, "."] },
        { type: "paragraph", content: ["Measurement and analytics:"] },
        {
          type: "list",
          items: [
            ["Adjust: measures which ads lead to installs and checks purchases. ", { text: "Adjust Privacy Policy", href: "https://www.adjust.com/terms/privacy-policy" }],
            ["Google Firebase (Analytics, Crashlytics and Remote Config): analytics, crash reports and game settings. ", { text: "Firebase Privacy", href: "https://firebase.google.com/support/privacy" }],
            ["GameAnalytics: gameplay analytics. ", { text: "GameAnalytics Privacy Notice", href: "https://www.gameanalytics.com/trust/privacy-notice" }],
          ],
        },
        { type: "paragraph", content: ["Apple and Google also process data when you download a game or buy something in it. The studio that made a game can see that game's data in these tools, to fix and improve it. We can also share data when the law requires it, or if our business or a game is sold."] },
      ],
    },
    {
      title: "Your choices",
      blocks: [
        {
          type: "list",
          items: [
            ["Consent form: in the European Economic Area, the UK and Switzerland, our games are set up to ask for your choice on ads when you first open them. If you refuse, the ads you see are not personalized. Basic analytics, such as counting a first launch, can start before you answer, and is reduced if you refuse."],
            ["Changing your mind: where a game offers privacy options in its settings, you can open the form again there. You can also write to us."],
            ["iPhone and iPad: Settings, Privacy & Security, Tracking. If you do not allow tracking, the game does not get your advertising identifier."],
            ["Android: Settings, Privacy, Ads, where you can reset or delete your advertising identifier."],
            ["Stopping everything: uninstalling a game stops any further collection by it. It does not delete what was already collected, so write to us for that."],
          ],
        },
      ],
    },
    {
      title: "How long data is kept",
      blocks: [
        { type: "paragraph", content: ["We keep data for as long as it is needed for the purposes above or required by law. Each partner also has its own periods, described in its policy. Firebase Crashlytics, for example, starts removing crash reports after 90 days."] },
      ],
    },
    {
      title: "Deleting your data",
      blocks: [
        { type: "paragraph", content: ["Write to ", emailLink, " with the name of the game, the kind of device, and your advertising identifier or player ID if you can find it. Without an identifier we are often unable to tell which data is yours. We will pass your request to the partners involved."] },
        { type: "paragraph", content: ["You can also ask some partners directly:"] },
        {
          type: "list",
          items: [
            ["AppLovin: ", { text: "dataprotection@applovin.com", href: "mailto:dataprotection@applovin.com" }],
            ["Adjust: ", { text: "privacy@adjust.com", href: "mailto:privacy@adjust.com" }, " or their ", { text: "Forget Device tool", href: "https://www.adjust.com/forget-device/" }],
            ["GameAnalytics: ", { text: "privacy@gameanalytics.com", href: "mailto:privacy@gameanalytics.com" }],
            ["Google: ", { text: "Google Account settings", href: "https://myaccount.google.com/data-and-privacy" }],
            ["Liftoff: ", { text: "Opt-out page", href: "https://liftoff.ai/opt-out/" }],
            ["Meta: ", { text: "Privacy rights requests", href: "https://help.meta.com/support/privacy" }],
            ["Unity: ", { text: "Unity Privacy Policy", href: "https://unity.com/legal/game-player-and-app-user-privacy-policy" }],
          ],
        },
      ],
    },
    {
      title: "Children's privacy",
      blocks: [
        { type: "paragraph", content: ["Our games are made for a general audience aged 16 and over. The age rating shown on the App Store or Google Play describes a game's content. It does not mean the game is made for children of that age."] },
        { type: "paragraph", content: ["We do not knowingly collect personal data from anyone under 16. If we learn that we have, we delete it and ask our partners to do the same."] },
        { type: "paragraph", content: ["In the United States, federal law gives extra protection to children under 13, and the rule above covers them. Some states also protect older minors. Where such a law applies to us, we do not sell the personal data of a player we know to be under the age it protects, or use it for targeted advertising, except as that law allows."] },
        { type: "paragraph", content: ["If you are a parent or guardian and believe your child has played one of our games and that data about them was collected, write to ", emailLink, " with the name of the game. We will delete the data we can identify and ask our partners to do the same. You can also limit tracking in the device settings described above, and limit downloads and purchases with the parental controls of the App Store or Google Play."] },
      ],
    },
    {
      title: "Your rights",
      blocks: [
        { type: "paragraph", content: ["Sorolla is based in France, so European data protection law applies to us. You can ask to see, correct, delete or receive a copy of your data, object to its use or limit it, withdraw a consent you gave, and leave instructions about your data after your death. Withdrawing consent does not affect what was done before. The exact rights can depend on the case and on where you live."] },
        { type: "paragraph", content: ["To use any of these rights, write to ", emailLink, ". We may ask for information to confirm the data is yours, and we answer within the time the law sets. If our answer does not satisfy you, you can complain to the French data protection authority, the ", { text: "CNIL", href: "https://www.cnil.fr/en" }, ", or to the authority where you live."] },
      ],
    },
    {
      title: "International transfers and security",
      blocks: [
        { type: "paragraph", content: ["Our partners work in several countries, including the United States, so data can be processed outside the country where you live. Where the law requires it, these transfers rely on safeguards such as decisions that a country protects data well enough, the European Commission's standard contractual clauses, the UK addendum or transfer agreement, the Data Privacy Framework between the United States and the EU, UK and Switzerland, or the Swiss equivalents."] },
        { type: "paragraph", content: ["We limit access to data to the people who need it. No system is perfectly secure, so we cannot promise absolute security."] },
      ],
    },
    {
      title: "This website",
      blocks: [
        { type: "paragraph", content: ["This website has no analytics, advertising or tracking. Your throws in the sea game stay in your browser, which also remembers whether you turned the sound off. Like any website, it is delivered by a host, Netlify, which processes technical data such as your IP address to do so. ", { text: "Netlify Privacy Policy", href: "https://www.netlify.com/privacy/" }] },
        { type: "paragraph", content: ["If you use the contact form, we receive your name, email, studio if you give it, subject and message, through Netlify. We use them only to answer you and follow up on your message, based on our legitimate interest in answering you, and delete them on request."] },
      ],
    },
    {
      title: "Changes to this policy",
      blocks: [
        { type: "paragraph", content: ["We may update this policy. The new version is posted on this page with a new date. If a change is significant, we will take reasonable steps to make it visible."] },
      ],
    },
    {
      title: "Contact us",
      blocks: [
        { type: "paragraph", content: ["For any question about this policy, write to ", emailLink, "."] },
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
