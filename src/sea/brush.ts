// Eight bristle stamps drawn once into one atlas: grey is how thick the paint lies, alpha is
// where it lies. Deterministic, so every visitor gets the same brush.
const STAMPS = 8;
/** stamps from here on are a loaded flat brush: square ends, no dry tail */
export const FLAT = 6;
const CELL_W = 256, CELL_H = 96, COLS = 2, ROWS = STAMPS / COLS;

/** Seeded random numbers (mulberry32): the same seed paints the same strokes for every visitor. */
export const mulberry = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Four long pulls of a wide brush. Red is thickness, green says which bristles carry another colour. */
export function longBrush(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const w = 1024, h = 128;
  c.width = w; c.height = h * 4;
  const g = c.getContext("2d")!;
  g.lineCap = "round";
  for (let n = 0; n < 4; n++) {
    const r = mulberry(401 + n * 77), oy = n * h;
    g.save();
    g.beginPath(); g.rect(0, oy, w, h); g.clip();
    const bristles = 120;
    const order = Array.from({ length: bristles }, (_, i) => i).sort(() => r() - 0.5);
    for (const pass of [0, 1]) for (const b of order) {
      const v = (b / (bristles - 1)) * 2 - 1, edge = Math.abs(v);
      if (pass && r() < 0.35) continue;
      const s0 = 0.012 + edge ** 4 * 0.03 + r() * 0.012;
      const s1 = 1 - 0.012 - edge ** 4 * 0.03 - r() * (pass ? 0.16 : 0.05) - (r() < 0.12 ? r() * 0.2 : 0);
      const height = Math.round((pass ? 120 : 70) + r() * 110 + (edge > 0.86 ? 40 : 0));
      const tint = r() < 0.16 ? 150 + r() * 105 : r() * 50;
      g.strokeStyle = `rgba(${height},${Math.round(tint)},0,${pass ? 0.75 : 1})`;
      g.lineWidth = pass ? 1 + r() * 1.6 : 2.6;
      const wob = r() * 6.28, amp = (r() - 0.5) * 1.8;
      g.beginPath();
      for (let k = 0; k <= 36; k++) {
        const s = s0 + (s1 - s0) * (k / 36);
        const y = oy + h / 2 + v * h * 0.455 + Math.sin(s * 9 + wob) * amp;
        if (k) g.lineTo(s * w, y); else g.moveTo(s * w, y);
      }
      g.stroke();
    }
    g.restore();
  }
  return c;
}

export function brushAtlas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = CELL_W * COLS;
  c.height = CELL_H * ROWS;
  const g = c.getContext("2d")!;
  g.lineCap = "round";
  for (let n = 0; n < STAMPS; n++) {
    const r = mulberry(7 + n * 131);
    const ox = (n % COLS) * CELL_W, oy = Math.floor(n / COLS) * CELL_H;
    g.save();
    g.beginPath();
    g.rect(ox, oy, CELL_W, CELL_H);
    g.clip();
    const flat = n >= FLAT;
    const bow = flat ? (r() - 0.5) * 5 : (r() - 0.5) * 22;
    const dry = flat ? 0.02 : 0.12 + r() * 0.3;
    const lead = flat ? 0.015 : 0.03 + r() * 0.05;
    const fat = CELL_H * (flat ? 0.37 : 0.3 + r() * 0.07);
    const bristles = 64;
    const order = Array.from({ length: bristles }, (_, i) => i).sort(() => r() - 0.5);
    for (const b of order) {
      const v = (b / (bristles - 1)) * 2 - 1;
      const edge = Math.abs(v);
      const s0 = lead + edge * edge * (flat ? 0.05 : 0.1) + r() * 0.03;
      const s1 = 1 - lead - edge * edge * (flat ? 0.05 : 0.09) - r() * dry;
      const grey = Math.round(70 + r() * 150 + (1 - edge) * 30);
      g.strokeStyle = `rgba(${grey},${grey},${grey},${0.75 + r() * 0.25})`;
      g.lineWidth = 2.2 + r() * 2.4;
      g.beginPath();
      for (let k = 0; k <= 20; k++) {
        const s = s0 + (s1 - s0) * (k / 20);
        const swell = flat ? 1 : Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.86 + 0.1)), 0.45);
        const x = ox + s * CELL_W;
        const y = oy + CELL_H / 2 + v * fat * swell + bow * (4 * (s - 0.5) * (s - 0.5) - 0.4);
        if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    // the ridge of paint a loaded brush leaves where it lands
    g.globalCompositeOperation = "source-atop";
    const ridge = g.createLinearGradient(ox + lead * CELL_W, 0, ox + 0.22 * CELL_W, 0);
    ridge.addColorStop(0, "rgba(255,255,255,.55)");
    ridge.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = ridge;
    g.fillRect(ox, oy, CELL_W, CELL_H);
    g.restore();
  }
  return c;
}
