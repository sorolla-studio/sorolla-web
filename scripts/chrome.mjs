// Headless Chrome or Edge, driven over the DevTools protocol, for the scripts that photograph the site.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { PROGRAMFILES = "", LOCALAPPDATA = "" } = process.env;
const X86 = process.env["PROGRAMFILES(X86)"] ?? "";
const INSTALLED = {
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/Applications/Chromium.app/Contents/MacOS/Chromium"],
  win32: [
    join(PROGRAMFILES, "Google/Chrome/Application/chrome.exe"), join(X86, "Google/Chrome/Application/chrome.exe"), join(LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
    join(X86, "Microsoft/Edge/Application/msedge.exe"), join(PROGRAMFILES, "Microsoft/Edge/Application/msedge.exe"),
  ],
  linux: ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"],
};

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** The site the scripts photograph. */
export const BASE = process.env.BASE ?? "http://localhost:3000";

/** Fails in one sentence when nothing answers at BASE. A first request can wait while the dev server compiles. */
export async function checkSite() {
  try { await fetch(BASE, { signal: AbortSignal.timeout(180000) }); }
  catch {
    console.error(`Nothing answers at ${BASE}: start npm run dev first, or point BASE at the server.`);
    process.exit(1);
  }
}

/** Starts a private headless browser. CHROME overrides which one. */
export async function openChrome() {
  if (typeof WebSocket === "undefined") throw new Error("This script needs Node 22 or newer.");
  const bin = process.env.CHROME ?? (INSTALLED[process.platform] ?? []).find((p) => existsSync(p));
  if (!bin) throw new Error("No Chrome or Edge found: set CHROME to the browser's executable.");
  const profile = mkdtempSync(join(tmpdir(), "sorolla-"));
  // the sea is WebGL: ask for the real GPU, Metal on a Mac and the default (Direct3D) elsewhere
  const gpu = process.platform === "darwin" ? ["--use-angle=metal"] : [];
  const proc = spawn(bin, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, ...gpu, "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars", "--mute-audio", "--no-first-run", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const devtools = await new Promise((ok, no) => {
    let err = "";
    const t = setTimeout(() => no(new Error(`${bin} did not start: ${err}`)), 20000);
    proc.on("error", (e) => { clearTimeout(t); no(e); });
    proc.stderr.on("data", (d) => { err += d; const m = /ws:\/\/\S+/.exec(err); if (m) { clearTimeout(t); ok(m[0]); } });
  });
  const tabs = await (await fetch(`http://127.0.0.1:${new URL(devtools).port}/json`)).json();
  const sock = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => { sock.onopen = r; });

  let id = 0;
  const waiting = new Map(), problems = [];
  let loads = 0;
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) { waiting.get(m.id)?.(m.result ?? {}); waiting.delete(m.id); return; }
    if (m.method === "Page.loadEventFired") loads++;
    if (m.method === "Runtime.exceptionThrown") problems.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(m.params.type)) problems.push(m.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
  };
  const send = (method, params = {}) => new Promise((r) => { waiting.set(++id, r); sock.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.value;
  await send("Page.enable");
  await send("Runtime.enable");

  return {
    send,
    /** errors and warnings the page logged */
    problems,
    /** loads url at a size, waits until `ready` (a page expression) holds, then lets it settle for `settle` ms */
    async open(url, [width, height, deviceScaleFactor], { ready = "true", settle = 2600, mobile = false } = {}) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor, mobile });
      const before = loads;
      await send("Page.navigate", { url });
      const until = Date.now() + 180000; // a cold dev server compiles the page first
      while (loads === before || !(await evaluate(`Boolean(${ready})`))) {
        if (Date.now() > until) throw new Error(`${url} was not ready after 3 minutes (waiting for ${ready}).`);
        await wait(250);
      }
      await wait(settle);
      await send("Runtime.evaluate", { expression: "document.querySelector('nextjs-portal')?.remove()" }); // the dev server's badge
    },
    eval: evaluate,
    async tap(x, y) {
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    },
    /** what the screen shows, or the whole page */
    async shot({ format = "jpeg", page = false } = {}) {
      const params = { format, ...(format === "jpeg" ? { quality: 86 } : {}) };
      if (page) {
        const { cssContentSize: s } = await send("Page.getLayoutMetrics");
        Object.assign(params, { captureBeyondViewport: true, clip: { x: 0, y: 0, width: s.width, height: s.height, scale: 1 } });
      }
      const { data } = await send("Page.captureScreenshot", params);
      return Buffer.from(data, "base64");
    },
    async close() {
      sock.close();
      proc.kill();
      await wait(400);
      // Windows can hold the profile a moment after the browser exits; it lives in the temp folder either way
      try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
    },
  };
}
