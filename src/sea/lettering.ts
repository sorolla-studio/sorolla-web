// "Just Play" as a sign painter would pull it: each letter is one to three strokes of a wide flat
// brush. Points are skeletons in units of x-height; the ribbon follows them.
type Pt = [number, number];
type Glyph = { w: number; strokes: Pt[][] };

const G: Record<string, Glyph> = {
  J: { w: 0.79, strokes: [
    [[0.2, 1.4], [0.5, 1.43], [0.86, 1.42]],
    [[0.62, 1.4], [0.63, 1.0], [0.62, 0.52], [0.52, 0.14], [0.28, -0.01], [0.06, 0.1], [0.0, 0.32]],
  ] },
  u: { w: 0.78, strokes: [
    [[0.02, 1.0], [0.0, 0.62], [0.05, 0.22], [0.28, 0.02], [0.52, 0.16], [0.66, 0.5], [0.69, 1.0]],
    [[0.69, 1.0], [0.68, 0.5], [0.74, 0.1], [0.84, 0.02]],
  ] },
  s: { w: 0.66, strokes: [
    [[0.62, 0.86], [0.46, 1.0], [0.22, 0.98], [0.1, 0.79], [0.2, 0.6], [0.44, 0.48], [0.6, 0.3], [0.5, 0.07], [0.26, -0.01], [0.0, 0.12]],
  ] },
  t: { w: 0.7, strokes: [
    [[0.3, 1.36], [0.28, 0.9], [0.26, 0.4], [0.32, 0.08], [0.5, 0.0], [0.68, 0.1]],
    [[0.0, 0.97], [0.34, 1.0], [0.7, 1.03]],
  ] },
  P: { w: 0.9, strokes: [
    [[0.06, 1.4], [0.05, 0.9], [0.03, 0.4], [0.02, 0.0]],
    [[-0.06, 1.36], [0.3, 1.44], [0.66, 1.4], [0.86, 1.14], [0.78, 0.82], [0.46, 0.66], [0.1, 0.66]],
  ] },
  l: { w: 0.16, strokes: [[[0.06, 1.48], [0.05, 1.0], [0.04, 0.4], [0.08, 0.02]]] },
  a: { w: 0.8, strokes: [
    [[0.64, 0.8], [0.48, 0.98], [0.22, 0.94], [0.04, 0.66], [0.04, 0.3], [0.2, 0.04], [0.42, 0.08], [0.6, 0.36], [0.66, 0.7]],
    [[0.68, 1.02], [0.66, 0.6], [0.68, 0.2], [0.82, 0.02]],
  ] },
  y: { w: 0.78, strokes: [
    [[0.02, 1.0], [0.1, 0.66], [0.26, 0.32], [0.4, 0.2]],
    [[0.76, 1.02], [0.62, 0.62], [0.46, 0.2], [0.3, -0.2], [0.08, -0.4], [-0.12, -0.36]],
  ] },
  " ": { w: 0.1, strokes: [] },
};

const GAP = 0.31;      // between letters
const HALF = 0.182;    // half width of the brush
const LINE = 1.86;     // line to line
export const CAP = 1.43;

function spline(p: Pt[], per = 9): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * b[j] + (c[j] - a[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * t3)) as Pt);
    }
  }
  out.push(p[p.length - 1]);
  return out;
}

export function measure(line: string) {
  let x = 0;
  for (const ch of line) x += G[ch].w + GAP;
  return x - GAP;
}

export type Lettering = { data: Float32Array; index: Uint16Array; halfW: number; halfH: number };
export const LETTER_FLOATS = 8;

/** Mesh on the sea plane that looks undistorted from the resting camera. */
export function lettering(lines: string[], box: { unit: number; cx: number; cy: number }, view: { focal: number; horizon: number; camH: number }): Lettering {
  const data: number[] = [], index: number[] = [];
  const widths = lines.map(measure);
  const totalH = CAP + (lines.length - 1) * LINE;
  const strokes: { pts: Pt[]; len: number }[] = [];
  lines.forEach((line, li) => {
    let x = -widths[li] / 2;
    const base = totalH / 2 - CAP - li * LINE;
    for (const ch of line) {
      for (const s of G[ch].strokes) {
        const pts = spline(s).map(([px, py]) => [x + px, base + py] as Pt);
        let len = 0;
        for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        strokes.push({ pts, len });
      }
      x += G[ch].w + GAP;
    }
  });
  const total = strokes.reduce((a, s) => a + s.len, 0);
  let before = 0;
  strokes.forEach((s, si) => {
    const first = data.length / LETTER_FLOATS;
    let run = 0;
    s.pts.forEach((p, i) => {
      const a = s.pts[Math.max(0, i - 1)], b = s.pts[Math.min(s.pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      if (i) run += Math.hypot(p[0] - s.pts[i - 1][0], p[1] - s.pts[i - 1][1]);
      const u = run / s.len;
      const press = 0.86 + 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.1)) - 0.1 * u;
      for (const side of [-1, 1]) {
        const w = HALF * press * side;
        const sx = box.cx + (p[0] - (dy / l) * w) * box.unit, sy = box.cy + (p[1] + (dx / l) * w) * box.unit;
        const z = (view.focal * view.camH) / (view.horizon - sy);
        data.push((sx * z) / view.focal, z, u, side, (before + run) / total, si % 4, s.len, 0);
      }
      if (i) { const n = first + i * 2; index.push(n - 2, n - 1, n, n, n - 1, n + 1); }
    });
    before += s.len;
  });
  return { data: new Float32Array(data), index: new Uint16Array(index), halfW: (Math.max(...widths) / 2) * box.unit, halfH: (totalH / 2) * box.unit };
}
