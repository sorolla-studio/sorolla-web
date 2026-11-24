// Plays the site the way a visitor does and saves what they see.
// With the dev server running (npm run dev): npm run look
// Pictures land in shots/now/; the run before moves to shots/before/, so every change has its before and after.
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { BASE, checkSite, openChrome, wait } from "./chrome.mjs";

const SHOTS = fileURLToPath(new URL("../shots/", import.meta.url));
const NOW = SHOTS + "now/", BEFORE = SHOTS + "before/";
// sizes that get the whole visit: first screen, a throw, its result, the reading, the page
const VISIT = { phone: [390, 844, 2], desktop: [1440, 900, 1] };
// sizes where the first screen is most likely to crowd
const EDGES = { "small-phone": [320, 568, 2], "phone-landscape": [844, 390, 2], tablet: [768, 1024, 2] };

await checkSite();
if (existsSync(NOW)) { rmSync(BEFORE, { recursive: true, force: true }); renameSync(NOW, BEFORE); }
mkdirSync(NOW, { recursive: true });
const saved = [];
const save = async (name, buf) => { writeFileSync(NOW + name, buf); saved.push(name); };
const chrome = await openChrome();
const sea = "(() => { const r = document.querySelector('.sea-play').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()";
// the sea has started (or shows its still painting where WebGL2 is missing)
const ready = "['idle', 'poster'].includes(document.querySelector('.sea')?.dataset.phase)";

try {
  for (const [name, size] of Object.entries(VISIT)) {
    const mobile = size[0] < 600;
    await chrome.open(BASE + "/", size, { mobile, ready, settle: 3000 });
    await save(`${name}-1-waiting.jpg`, await chrome.shot());
    const [x, y] = await chrome.eval(sea);
    await chrome.tap(x, y); await wait(1500);
    await chrome.tap(x, y); await wait(650);
    await save(`${name}-2-throw.jpg`, await chrome.shot());
    await wait(900); await chrome.tap(x, y); await wait(3600);
    await save(`${name}-3-result.jpg`, await chrome.shot());
    await chrome.eval("document.querySelector('.sea-card a')?.click()"); await wait(2800);
    await save(`${name}-4-reading.jpg`, await chrome.shot());
    // walk down once so everything that waits to be seen draws, then photograph the page two screens at a time
    const tall = await chrome.eval("document.documentElement.scrollHeight");
    for (let top = 0; top < tall; top += size[1]) { await chrome.eval(`window.scrollTo({ top: ${top}, behavior: "instant" })`); await wait(250); }
    await chrome.eval("window.scrollTo({ top: 0, behavior: 'instant' })"); await wait(600);
    const page = sharp(await chrome.shot({ page: true }));
    const { width, height } = await page.metadata(), step = size[1] * size[2] * 2;
    for (let top = 0, n = 1; top < height; top += step, n++) {
      await save(`${name}-5-page-${n}.jpg`, await page.clone().extract({ left: 0, top, width, height: Math.min(step, height - top) }).jpeg({ quality: 82 }).toBuffer());
    }
  }
  for (const [name, size] of Object.entries(EDGES)) {
    await chrome.open(BASE + "/", size, { mobile: Math.min(size[0], size[1]) < 600, ready, settle: 3000 });
    await save(`${name}.jpg`, await chrome.shot());
  }
} finally { await chrome.close(); }

console.log(`Saved in ${NOW}:\n  ${saved.join("\n  ")}`);
console.log(chrome.problems.length ? `Console problems:\n  ${[...new Set(chrome.problems)].join("\n  ")}` : "Console: clean");
process.exit(chrome.problems.length ? 1 : 0);
