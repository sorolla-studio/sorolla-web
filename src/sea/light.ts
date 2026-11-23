// Light of the day, keyed by distance travelled. Colours were sampled from the water in
// four Sorolla paintings (public domain), then pushed for screens.
export type Rgb = [number, number, number];

export type Light = {
  deep: Rgb; mid: Rgb; teal: Rgb; light: Rgb;
  cool: Rgb; warm: Rgb; hot: Rgb;
  skyTop: Rgb; skyLow: Rgb; sun: Rgb; foam: Rgb;
  /** sun height above the horizon in screen units, and how strong its path on the water is */
  sunY: number; glitter: number;
};

const hex = (h: string): Rgb => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;

const key = (
  deep: string, mid: string, teal: string, light: string,
  cool: string, warm: string, hot: string,
  skyTop: string, skyLow: string, sun: string, foam: string,
  sunY: number, glitter: number,
): Light => ({
  deep: hex(deep), mid: hex(mid), teal: hex(teal), light: hex(light),
  cool: hex(cool), warm: hex(warm), hot: hex(hot),
  skyTop: hex(skyTop), skyLow: hex(skyLow), sun: hex(sun), foam: hex(foam),
  sunY, glitter,
});

/** Metres at which each light is reached, with the name shown to the player. */
export const DAY: { at: number; name: string; light: Light }[] = [
  { at: 0, name: "noon", light: key("12304f", "235a80", "4d93a6", "a9d3d0", "6f78b0", "8a6a5c", "e8825f", "6fb0d4", "d8ece6", "fff6da", "fdf6e2", 1.1, 0.5) },
  { at: 140, name: "afternoon", light: key("16365a", "2f5f7c", "5f8f6c", "d9d596", "6a70b4", "b98a3c", "e2734f", "77b0cf", "f4e9c0", "fff0b8", "fff3cf", 0.62, 0.45) },
  { at: 320, name: "golden hour", light: key("2a2740", "4e4a63", "a07a48", "f3cf84", "7a5a8c", "c98a2e", "d4483f", "e2a071", "ffdf92", "fff3c4", "fff0c2", 0.26, 1) },
  { at: 560, name: "dusk", light: key("211f45", "47457e", "8a78ab", "f0b3a2", "5a55a0", "c2607a", "ef7d62", "565a9c", "f7a27c", "ffd0a0", "ffe1cf", 0.08, 0.8) },
  { at: 860, name: "night", light: key("081230", "13305c", "285d8c", "8fb8dc", "3b3f86", "3f6a86", "e8825f", "0c1a40", "27477a", "f2f0d8", "dfeaf2", 0.5, 0.7) },
];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t,
];

export function lightAt(metres: number): Light {
  let i = DAY.length - 2;
  while (i > 0 && DAY[i].at > metres) i--;
  const a = DAY[i], b = DAY[i + 1];
  const u = Math.min(1, Math.max(0, (metres - a.at) / (b.at - a.at)));
  const t = u * u * (3 - 2 * u);
  const out = {} as Light;
  for (const k of Object.keys(a.light) as (keyof Light)[]) {
    const x = a.light[k], y = b.light[k];
    (out as Record<string, unknown>)[k] =
      typeof x === "number" ? x + ((y as number) - x) * t : mix(x, y as Rgb, t);
  }
  return out;
}

export function lightName(metres: number): string {
  return DAY.reduce((near, k) => (Math.abs(k.at - metres) < Math.abs(near.at - metres) ? k : near)).name;
}
