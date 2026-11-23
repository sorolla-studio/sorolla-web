export const homeContent = {
  hero: {
    title: "Just Play",
    line: "Sorolla publishes mobile games. Send us yours and we will tell you what players do with it.",
    button: "Send us your game",
    sea: { throw: "Tap to throw", time: "Tap as the ring closes", again: "Tap to throw again", read: "See how that reads", sank: "It sank. Tap again each time the ring closes on it." },
  },
  read: {
    before: {
      title: "Throw one. We will read it.",
      body: "This is what we do with a prototype: watch the first minute of play and set it next to everyone else’s. Play the sea and the chart fills in with yours.",
      button: "Go and throw one",
    },
    after: {
      button: "Throw again",
      one: { title: "One throw, then you scrolled.", body: "That is where every test starts. The first throw has to earn the second, and that is the number we would work on with you." },
      few: { title: "You threw again.", body: "Nobody asked you to. A second go is the first thing we look for in a prototype, before anyone talks about money." },
      many: { title: "You kept throwing.", body: "Nobody asked you to. Coming straight back is the best sign a prototype can give, and it shows in the first minute." },
    },
    chart: "500 simulated players, each one a dab of paint, placed by how far their best throw went. Nothing about your visit leaves this page.",
    you: "You",
  },
  games: { title: "Out now", play: "Play it here", close: "Close the game" },
  work: {
    title: "What happens after you send it",
    steps: [
      { name: "Read", body: "We start from how the market behaves: rankings, retention curves, what creatives are doing. Not from what feels good in a meeting." },
      { name: "Test", body: "Your prototype goes to real players with a real budget. CPI, D1, D7, session length: you see the same numbers we see." },
      { name: "Decide", body: "We share results as they come in. If the game clears, we scale it together. If it does not, we say so quickly." },
      { name: "Scale", body: "SDK, creatives, user acquisition, monetization, live ops. We treat growth as part of the product." },
    ],
  },
  contact: {
    title: "Send us your game",
    body: "A real human reads every message. We try to reply within a week, even if the answer is no.",
    orMail: "Or write to",
    submit: "Send",
    sending: "Sending",
    sent: { title: "It is with us.", body: "We try to reply within a week, even if the answer is no." },
    failed: "That did not go through. Please write to us by email instead:",
    missing: "Fill this in so we can answer you.",
    badEmail: "That email looks incomplete, check it once more.",
    reasonLabel: "What is it about?",
    reasons: [
      { value: "studio", label: "A game to publish", placeholder: "What is it, how far along is it, and where can we play it? A store or TestFlight link is perfect." },
      { value: "press", label: "Press", placeholder: "What are you working on, and what do you need from us?" },
      { value: "careers", label: "A job", placeholder: "A short intro, plus links to work you are proud of." },
      { value: "general", label: "Something else", placeholder: "Tell us what you have in mind." },
    ],
    fields: { name: "Your name", email: "Email", company: "Studio", optional: "optional", message: "Message", honeypot: "Leave this empty" },
  },
} as const;
