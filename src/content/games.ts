/** Games on the App Store under Sorolla, checked 2026-11-23. */
export type Game = {
  slug: string; name: string; line: string;
  /** pixels of public/games/<slug>.webp, cut from the game's own App Store pictures */
  size: [number, number];
  appStore: string; googlePlay?: string;
};

export const games: Game[] = [
  {
    slug: "sweep-collector",
    name: "Sweep Collector",
    line: "A robot vacuum with an appetite.",
    size: [1000, 1493],
    appStore: "https://apps.apple.com/us/app/sweep-collector/id6757695295",
    googlePlay: "https://play.google.com/store/apps/details?id=com.COGInteractive.SweepCollector",
  },
  {
    slug: "happy-snake-3d",
    name: "Happy Snake 3D",
    line: "Eat the dessert table, grow, repeat.",
    size: [900, 915],
    appStore: "https://apps.apple.com/us/app/happy-snake-3d/id6755388400",
    googlePlay: "https://play.google.com/store/apps/details?id=com.sorolla.hungrysnake3d",
  },
  {
    slug: "sector-z",
    name: "Sector Z",
    line: "One street, one barricade, a lot of zombies.",
    size: [720, 1340],
    appStore: "https://apps.apple.com/us/app/sector-z/id6785464580",
  },
  {
    slug: "raft-evolution",
    name: "Raft Evolution",
    line: "Barrels, tyres, two rockets. It floats.",
    size: [900, 978],
    appStore: "https://apps.apple.com/us/app/raft-evolution/id6757224854",
    googlePlay: "https://play.google.com/store/apps/details?id=com.gembirdstudios.raftevolution",
  },
  {
    slug: "rolling-wheel",
    name: "Rolling Wheel!",
    line: "A tyre, a desert, no brakes.",
    size: [900, 1213],
    appStore: "https://apps.apple.com/us/app/rolling-wheel/id6758406008",
  },
];
