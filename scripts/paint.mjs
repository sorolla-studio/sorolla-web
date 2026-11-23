// Saves the still pictures the site uses, straight from the painter, so they always match the live sea.
// With the dev server running (npm run dev): npm run paint
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { openChrome } from "./chrome.mjs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = fileURLToPath(new URL("../public/paint/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const chrome = await openChrome();
await chrome.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });

async function shoot(query, w, h, dpr) {
  await chrome.open(`${BASE}/paint?${query}`, [w, h, dpr]);
  return chrome.shot({ format: "png" });
}
const save = (buf, name, q) => sharp(buf).webp({ quality: q, alphaQuality: 90, effort: 6 }).toFile(OUT + name).then((i) => console.log(name, i.width + "x" + i.height, Math.round(i.size / 1024) + " KB"));

// brush shapes, used as CSS masks
await save(await shoot("what=swipe&row=0", 640, 132, 1), "swipe.webp", 80);
await save(await shoot("what=dab", 192, 156, 1), "dab.webp", 80);
await save(await shoot("what=frame", 480, 854, 1), "frame-tall.webp", 80);
await save(await shoot("what=frame", 600, 600, 1), "frame-square.webp", 80);
await save(await shoot("what=frame", 1200, 420, 1), "frame-wide.webp", 80);
// the first screen before the live sea is ready
for (const [name, q] of [["", ""], ["-bare", "&title=0"]]) {
  await save(await shoot("what=sea" + q, 1440, 764, 1.25), `sea-wide${name}.webp`, 72);
  await save(await shoot("what=sea" + q, 390, 650, 2), `sea-tall${name}.webp`, 72);
}
// one sea from noon to night: same strokes in every light, blended left to right
const lights = [0, 150, 330, 580, 860], W = 2000, H = 620;
const layers = [];
for (const [i, at] of lights.entries()) {
  const png = await sharp(await shoot(`what=sea&at=${at}&title=0&edge=0&horizon=0.45`, W, H, 1)).removeAlpha().toBuffer();
  if (!i) { layers.push(png); continue; }
  const a = (i - 0.5 - 0.42) / (lights.length - 1) * 100, b = (i - 0.5 + 0.42) / (lights.length - 1) * 100;
  const mask = Buffer.from(`<svg width="${W}" height="${H}"><linearGradient id="g"><stop offset="${a}%" stop-color="#fff" stop-opacity="0"/><stop offset="${b}%" stop-color="#fff"/></linearGradient><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  layers.push(await sharp(png).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer());
}
await save(await sharp(layers[0]).composite(layers.slice(1).map((input) => ({ input }))).png().toBuffer(), "day.webp", 74);
// the last picture on every page
await save(await shoot("what=sea&at=880&title=0&edge=0&horizon=0.4", 1800, 620, 1), "night.webp", 70);
// link preview
await sharp(await shoot("what=sea&edge=0", 1200, 630, 1)).flatten({ background: "#f1eef6" }).jpeg({ quality: 84 }).toFile(fileURLToPath(new URL("../src/app/opengraph-image.jpg", import.meta.url)));
console.log("opengraph-image.jpg");

await chrome.close();
process.exit(0);
