"use client";

import { useEffect, useRef } from "react";
import { World } from "@/sea/world";
import { brushAtlas, longBrush } from "@/sea/brush";
import { mulberry } from "@/sea/strokes";

const quiet = { metres() {}, say() {}, state() {}, firstTap() {}, ran() {} };

/** One pull of the wide brush. */
function swipe(g: CanvasRenderingContext2D, w: number, h: number, row: number) {
  g.drawImage(longBrush(), 0, row * 128, 1024, 128, 0, 0, w, h);
  g.globalCompositeOperation = "source-in"; g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
}

/** Three short pulls side by side. */
function dab(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = mulberry(21);
  for (let i = 0; i < 3; i++) g.drawImage(longBrush(), 0, ((i + 1) * 128) % 512, 1024, 128, w * r() * 0.1, h * (0.02 + i * 0.29), w * (0.86 + r() * 0.05), h * 0.4);
  g.globalCompositeOperation = "source-in"; g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
}

/** A picture's edge: rows of strokes that cover the middle and end unevenly. */
function frame(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = mulberry(w * 7 + h);
  const brush = longBrush(), dab = brushAtlas();
  const m = Math.min(w, h) * 0.035, th = Math.min(w, h) * 0.11;
  for (let y = m + th * 0.5; y < h - m - th * 0.3; y += th * 0.4) {
    // the first and last pulls stop short, so the corners are never square
    const outer = Math.max(0, 1 - Math.min(y - m, h - m - y) / (th * 1.5));
    const x0 = m * (0.1 + r() * 1.3) + w * 0.14 * outer * r(), x1 = w - m * (0.1 + r() * 1.5) - w * 0.2 * outer * r();
    const flip = r() < 0.5;
    g.save(); g.translate(w / 2, y); g.rotate((r() - 0.5) * (0.012 + 0.03 * outer)); if (flip) g.scale(-1, 1);
    const half = (x1 - x0) / 2;
    g.drawImage(brush, 0, Math.floor(r() * 4) * 128, 1024, 128, -half, -th / 2, half * 2, th);
    g.restore();
  }
  for (let i = 0; i < 16; i++) g.drawImage(dab, 0, Math.floor(r() * 3) * 96, 256, 96, r() * w * 0.8, r() < 0.5 ? m * 0.3 : h - m * 0.6 - th * 0.4, w * 0.22, th * 0.4);
  g.globalCompositeOperation = "source-in"; g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
}

export default function PaintTable() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!, q = new URLSearchParams(location.search), what = q.get("what") ?? "sea";
    const w = innerWidth, h = innerHeight;
    if (what === "sea") {
      const world = new World(el, quiet, { reduced: true, still: { at: Number(q.get("at") ?? 0), title: q.get("title") !== "0", edge: q.get("edge") !== "0", horizon: q.has("horizon") ? Number(q.get("horizon")) : undefined } });
      return () => world.destroy();
    }
    const c = document.createElement("canvas");
    c.width = w * devicePixelRatio; c.height = h * devicePixelRatio; c.style.width = "100%";
    const g = c.getContext("2d")!;
    g.scale(devicePixelRatio, devicePixelRatio);
    if (what === "swipe") swipe(g, w, h, Number(q.get("row") ?? 0)); else if (what === "dab") dab(g, w, h); else frame(g, w, h);
    el.appendChild(c);
    return () => c.remove();
  }, []);
  return (
    <>
      <style>{"html,body{background:transparent!important;margin:0}"}</style>
      <div ref={host} className="sea-paint" style={{ position: "fixed", inset: 0 }} />
    </>
  );
}
