// Saves the still pictures the site uses, straight from the painter, so they always match the live sea.
// Needs the dev server: npm run dev -- -p 4961, then: CHROME=/path/to/chrome node scripts/paint.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE ?? "http://localhost:4961";
const OUT = new URL("../public/paint/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), "paint-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars", "--no-first-run", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const ws = await new Promise((ok, no) => {
  let err = "";
  const t = setTimeout(() => no(new Error("no devtools: " + err)), 15000);
  chrome.stderr.on("data", (d) => { err += d; const m = /ws:\/\/\S+/.exec(err); if (m) { clearTimeout(t); ok(m[0]); } });
});
const tabs = await (await fetch(`http://127.0.0.1:${new URL(ws).port}/json`)).json();
const sock = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => { sock.onopen = r; });
let id = 0;
const waiting = new Map();
sock.onmessage = (e) => { const m = JSON.parse(e.data); waiting.get(m.id)?.(m.result); waiting.delete(m.id); };
const send = (method, params = {}) => new Promise((r) => { waiting.set(++id, r); sock.send(JSON.stringify({ id, method, params })); });
await send("Page.enable");
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });

async function shoot(query, w, h, dpr) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
  await send("Page.navigate", { url: `${BASE}/paint?${query}` });
  await new Promise((r) => setTimeout(r, 2600));
  await send("Runtime.evaluate", { expression: "document.querySelector('nextjs-portal')?.remove()" });
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  return Buffer.from(data, "base64");
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
await sharp(await shoot("what=sea&edge=0", 1200, 630, 1)).flatten({ background: "#f1eef6" }).jpeg({ quality: 84 }).toFile(new URL("../src/app/opengraph-image.jpg", import.meta.url).pathname);
console.log("opengraph-image.jpg");

sock.close(); chrome.kill();
await new Promise((r) => setTimeout(r, 300));
rmSync(profile, { recursive: true, force: true });
process.exit(0);
