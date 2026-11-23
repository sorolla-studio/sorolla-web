import { STROKE, type Boat } from "./painter";
import { FLAT } from "./brush";
import type { Light, Rgb } from "./light";

/** Growable list of free strokes, reused every frame. */
export class StrokeList {
  data = new Float32Array(3600 * STROKE);
  count = 0;
  clear() { this.count = 0; }
  add(x: number, y: number, z: number, mode: 0 | 1 | 2, len: number, thick: number, angle: number, bend: number, c: Rgb, a = 1, stamp = 0, paint = 0.8) {
    if (this.count >= 3600) return;
    this.data.set([x, y, z, mode, len, thick, angle, bend, c[0], c[1], c[2], a, stamp, paint, 0, 0], this.count * STROKE);
    this.count++;
  }
}

export const mulberry = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const scale = (a: Rgb, k: number): Rgb => [a[0] * k, a[1] * k, a[2] * k];
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Sky: long wet strokes, clouds with violet undersides, the sun when it is low enough to be in frame. */
export function paintSky(out: StrokeList, L: Light, aspect: number, horizon: number, time: number, sunX: number) {
  const disc = L.sunY < 0.9 && L.glitter > 0.2, sunAt = horizon + L.sunY * (disc ? 0.5 : 1);
  out.clear();
  const r = mulberry(91);
  const span = 1.06 - horizon;
  const rows = 11, cols = Math.ceil(aspect * 11);
  for (let j = rows; j >= 0; j--) {
    for (let i = 0; i < cols; i++) {
      const v = (j + r() * 0.9) / rows;
      const x = ((i + r()) / cols) * 2 - 1;
      const sx = x * (aspect + 0.12), sy = horizon + v * span;
      const drift = sx + Math.sin(time * 0.05 + i) * 0.015;
      const cloud = Math.sin(drift * 2.3 + v * 5 + 1.7) * 0.5 + Math.sin(drift * 5.1 - v * 9 + time * 0.03) * 0.35 + (r() - 0.5) * 0.5;
      let c = mix(L.skyLow, L.skyTop, smooth(0.0, 1, v + (r() - 0.5) * 0.3));
      if (cloud > 0.36 && v > 0.12) c = mix(c, mix(L.foam, L.cool, smooth(0.36, 1.1, cloud) * 0.2 + (r() < 0.25 ? 0.3 : 0)), 0.62);
      else if (r() < 0.08) c = mix(c, L.cool, 0.22);
      const d = Math.hypot(drift - sunX, (sy - sunAt) * 1.1);
      c = mix(c, L.sun, Math.exp(-d * d * 7) * 0.85 * Math.min(1, L.glitter * 1.3));
      out.add(drift, sy, 0, 1, 0.1 + r() * 0.13, 0.016 + r() * 0.015, (r() - 0.5) * 0.3 + cloud * 0.08, (r() - 0.5) * 0.3, c, 1, Math.floor(r() * 8), 0.5 + r() * 0.3);
    }
  }
  // sun
  if (disc) {
    const cy = sunAt;
    const hot = mix(L.sun, [1, 1, 0.97], 0.5);
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2, rad = 0.05 + r() * 0.09;
      out.add(sunX + Math.cos(a) * rad, cy + Math.sin(a) * rad, 0, 1, 0.05, 0.014, a + Math.PI / 2, 0.5, mix(L.sun, L.skyLow, 0.25 + rad * 3), 0.85, i % FLAT, 0.3);
    }
    for (let i = 0; i < 9; i++) { const h = (i - 4) / 4.6; out.add(sunX, cy + h * 0.044, 0, 1, 0.046 * Math.sqrt(1 - h * h) + 0.004, 0.011, 0.06, 0.05, hot, 1, FLAT + (i % 2), 0.35); }
  }
  // a cape on the horizon
  for (let i = 0; i < 46; i++) {
    const t = r();
    const x = -aspect - 0.05 + t * aspect * 0.62;
    const top = 0.085 * (1 - t) ** 0.8 * (0.8 + 0.2 * Math.sin(t * 17));
    const y = horizon + r() * top;
    const c = mix(mix(L.cool, L.skyLow, 0.35 + t * 0.4), L.warm, r() < 0.3 ? 0.4 : 0.1);
    out.add(x, y, 0, 1, 0.05 + r() * 0.05, 0.011, (r() - 0.7) * 0.45, 0.1, c, 1, i % 8, 0.6);
  }
  // the far sea, below the last band the water shader reaches
  for (let j = 0; j < 4; j++) for (let i = 0; i < 26; i++) {
    const c = mix(mix(L.mid, L.teal, r()), L.skyLow, 0.35 + r() * 0.3);
    out.add(-aspect + ((i + r()) / 25) * 2 * aspect, horizon - 0.004 - j * 0.0105, 0, 1, 0.05 + r() * 0.07, 0.0062, 0, 0, c, 1, i % FLAT, 0.35);
  }
}

/** A small lateen boat: a main sail, a jib, a hull. Unit size, about 1.5 high. */
export function paintBoat(out: StrokeList, b: Boat, L: Light, camX: number, camZ: number, time: number, seed: number) {
  const z = b.z - camZ;
  if (z < 1.2) return;
  const r = mulberry(seed * 977 + 5);
  const bob = Math.sin(time * 1.15 + seed * 2) * 0.035, roll = b.lean + Math.sin(time * 0.95 + seed) * 0.035;
  const ca = Math.cos(roll), sa = Math.sin(roll), s = b.scale;
  const far = smooth(10, 60, z) * 0.42;
  const put = (x: number, y: number, len: number, thick: number, ang: number, bend: number, c: Rgb, paint = 0.9, a = 1, stamp = Math.floor(r() * FLAT)) =>
    out.add(b.x - camX + (x * ca - y * sa) * s, (y * ca + x * sa + bob) * s, z, 0, len * s, thick * s, ang + roll, bend, mix(c, L.skyLow, far), a, stamp, paint);
  const lit = mix(L.foam, [1, 1, 0.97], 0.35), shade = mix(L.foam, L.cool, 0.45), warm = mix(L.foam, L.hot, 0.24);
  // hull
  put(-0.02, 0.015, 0.6, 0.05, 0, 0.16, scale(L.deep, 0.9));
  put(0.0, 0.05, 0.62, 0.05, 0, 0.14, mix(L.warm, L.deep, 0.35));
  put(-0.05, 0.085, 0.6, 0.032, 0.01, 0.13, L.hot);
  put(0.02, 0.115, 0.56, 0.02, 0, 0.12, lit, 1);
  // a sail is pulled in strokes that run along its long free edge and end against the mast
  const cloth = (tip: number, mast: number, foot: number, head: number, n: number, dark: Rgb, bright: Rgb, bow: number) => {
    const w = mast - tip, h = head - foot;
    for (let i = n - 1; i >= 0; i--) {
      const x = tip + (w * (i + 0.12)) / n;
      const top = foot + (h * (mast - x)) / w;
      const len = Math.hypot(mast - x, top - foot) / 2;
      const c = mix(bright, dark, Math.min(1, (i / n) * 0.75 + (r() - 0.5) * 0.3));
      put((x + mast) / 2, (foot + top) / 2, len - 0.004, (Math.abs(w) / n) * 0.92, Math.atan2(top - foot, mast - x), bow, c, 0.8, 1, FLAT + (i % 2));
    }
  };
  cloth(-0.64, 0.012, 0.16, 1.5, 6, shade, lit, 0.05);
  cloth(0.5, 0.068, 0.17, 1.18, 4, mix(shade, L.teal, 0.35), mix(shade, lit, 0.35), -0.05);
  put(-0.2, 0.5, 0.16, 0.03, 1.12, 0.1, warm, 0.9);
  put(-0.31, 0.155, 0.33, 0.016, 0.01, 0, mix(L.warm, L.deep, 0.45));
  put(0.04, 0.83, 0.76, 0.034, Math.PI / 2, 0.01, mix(L.warm, L.deep, 0.55), 1, 1, FLAT);
  // where it sits in the water
  for (let i = 0; i < 7; i++) put(-0.55 + i * 0.19, -0.015 + r() * 0.02, 0.12, 0.016, (r() - 0.5) * 0.2, 0.2, mix(L.foam, L.teal, r() * 0.6), 0.9, 0.9);
}

/** Bare canvas showing under the last strokes of the picture. */
export function paintEdge(out: StrokeList, aspect: number, pxPerUnit: number) {
  out.clear();
  const r = mulberry(12);
  const deep = 46 / pxPerUnit; // how far the ragged edge reaches into the picture, 46 css px
  const n = Math.ceil(aspect * pxPerUnit / 34);
  const white: Rgb = [1, 1, 1];
  for (let i = -1; i <= n; i++) {
    const x = -aspect + (2 * aspect * (i + r())) / n;
    const len = (90 + r() * 120) / pxPerUnit;
    out.add(x, -1 + deep * (r() * 0.72), 0, 1, len, deep * (0.16 + r() * 0.16), (r() - 0.5) * 0.16, (r() - 0.5) * 0.2, white, 1, Math.floor(r() * FLAT));
  }
  for (let i = 0; i <= n; i++) out.add(-aspect + (2 * aspect * i) / n, -1 + deep * 0.05, 0, 1, 130 / pxPerUnit, deep * 0.34, (r() - 0.5) * 0.04, 0, white, 1, FLAT + (i % 2));
}
