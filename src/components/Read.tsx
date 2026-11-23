"use client";

import { useEffect, useRef } from "react";
import { fill, NB } from "@/content/fill";
import { homeContent } from "@/content/home";
import { useSession } from "@/sea/session";
import { beats, crowd } from "@/sea/crowd";
import { brushAtlas, FLAT, longBrush } from "@/sea/brush";
import { DAY, lightAt, type Rgb } from "@/sea/light";
import { mulberry } from "@/sea/strokes";

const t = homeContent.read;
const FAR = 2400, BEND = 60; // metres at the right edge, and how soon the scale starts to squeeze
const REVEAL = 900; // milliseconds
const PULL = 22; // width of the visitor's bar, in pixels
const at = (m: number) => Math.log1p(Math.min(m, FAR) / BEND) / Math.log1p(FAR / BEND);

/** One coral pull of the wide brush, for the visitor's own throw. */
function coralPull() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 64;
  const g = c.getContext("2d")!;
  g.drawImage(longBrush(), 0, 0, 1024, 128, 0, 0, 512, 64);
  g.globalCompositeOperation = "source-in"; g.fillStyle = "#dd5a36"; g.fillRect(0, 0, 512, 64);
  return c;
}

let tinted: Map<string, HTMLCanvasElement> | null = null;
function dab(colour: Rgb, stamp: number, atlas: HTMLCanvasElement) {
  tinted ??= new Map();
  const key = colour.map((c) => Math.round(c * 31)).join() + stamp;
  let c = tinted.get(key);
  if (!c) {
    c = document.createElement("canvas"); c.width = 128; c.height = 48;
    const g = c.getContext("2d")!;
    g.drawImage(atlas, (stamp % 2) * 256, Math.floor(stamp / 2) * 96, 256, 96, 0, 0, 128, 48);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = `rgb(${colour.map((v) => Math.round(v * 255)).join()})`; g.fillRect(0, 0, 128, 48);
    g.globalCompositeOperation = "soft-light"; g.globalAlpha = 0.3;
    g.drawImage(atlas, (stamp % 2) * 256, Math.floor(stamp / 2) * 96, 256, 96, 0, 0, 128, 48);
    tinted.set(key, c);
  }
  return c;
}

function Chart({ best }: { best: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const atlas = brushAtlas(), pull = coralPull();
    const players = crowd();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, t0 = 0, shown = false;
    const paint = (k: number) => {
      const w = el.clientWidth, h = el.clientHeight, dpr = Math.min(devicePixelRatio, 2);
      if (el.width !== Math.round(w * dpr)) { el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); }
      const g = el.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const r = mulberry(5);
      const bins = Math.max(18, Math.round(w / 30)), bw = w / bins;
      const heaps = new Array<number>(bins).fill(0);
      // the heap's outline: players near each column, smoothed so a chance cluster is not a tower
      let shape = new Array<number>(bins).fill(0);
      players.forEach((m) => { shape[Math.min(bins - 1, Math.floor(at(m) * bins))]++; });
      for (let pass = 0; pass < 2; pass++) shape = shape.map((n, b) => ((shape[b - 1] ?? n) + 2 * n + (shape[b + 1] ?? n)) / 4);
      // players come sorted by distance, so each takes the next free place from the left
      let col = 0, upTo = shape[0];
      const place = players.map((_, i) => { while (col < bins - 1 && i >= upTo) upTo += shape[++col]; return col; });
      place.forEach((b) => { heaps[b]++; });
      const rise = Math.min(10, (h - 70) / Math.max(...heaps));
      const top = (b: number) => (heaps[b] ?? 0) * rise;
      const mine = Math.min(bins - 1, Math.floor(at(best) * bins));
      // the visitor's bar lifts its label clear of everything the label spans
      const span = Math.ceil((el.parentElement!.querySelector<HTMLElement>(".chart-you")?.offsetWidth ?? 0) / bw);
      const from = at(best) > 0.8 ? mine - span : mine - 1;
      const tall = Math.min(h - 24, Math.max(h * 0.26, ...Array.from({ length: span + 2 }, (_, k) => top(from + k))) + 30);
      const level = new Array<number>(bins).fill(0);
      players.forEach((m, i) => {
        const b = place[i], y = h - 10 - level[b]++ * rise;
        const jitter = r(), tilt = r(), pick = r(), tone = r();
        if (i / players.length > k * 1.02) return;
        const L = lightAt(m);
        const c = tone < 0.3 ? L.mid : tone < 0.55 ? L.teal : tone < 0.75 ? L.light : tone < 0.88 ? L.cool : L.warm;
        const x = Math.min(w - bw * 0.9, Math.max(bw * 0.9, (b + 0.5 + (jitter - 0.5) * 0.7) * bw));
        g.save(); g.translate(x, y); g.rotate((tilt - 0.5) * 0.28);
        g.drawImage(dab(c, Math.floor(pick * FLAT), atlas), -bw * 0.86, -rise * 1.25, bw * 1.72, rise * 2.5);
        g.restore();
      });
      el.parentElement!.style.setProperty("--you", `${Math.round(tall)}px`);
      if (best > 0) {
        g.save(); g.translate(Math.max(PULL / 2, Math.min(w - PULL / 2, at(best) * w)), h - 2); g.rotate(-Math.PI / 2);
        g.drawImage(pull, 0, -PULL / 2, tall * Math.min(1, k * 1.2), PULL);
        g.restore();
      }
    };
    const run = (now: number) => {
      t0 ||= now;
      const u = Math.min(1, (now - t0) / REVEAL);
      paint(1 - (1 - u) ** 2);
      if (u < 1) raf = requestAnimationFrame(run);
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || shown) return;
      shown = true;
      if (still) paint(1); else raf = requestAnimationFrame(run);
    }, { threshold: 0.35 });
    io.observe(el);
    const ro = new ResizeObserver(() => { if (shown) paint(1); });
    ro.observe(el);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [best]);
  return <canvas ref={ref} aria-hidden="true" />;
}

export default function Read() {
  const s = useSession();
  const n = s.runs.length;
  const best = s.runs.reduce((m, r) => Math.max(m, r.metres), 0);
  const say = n === 0 ? t.before : n === 1 ? t.after.one : n < 4 ? t.after.few : t.after.many;
  const seconds = (ms: number) => (ms < 60_000 ? `${Math.max(1, Math.round(ms / 1000))}${NB}s` : `${Math.floor(ms / 60_000)}${NB}min ${Math.round((ms % 60_000) / 1000)}${NB}s`);
  const share = beats(best);
  const rank = share === 0 ? t.rank.none : share === 100 ? t.rank.all : t.rank.some;
  const visit = fill(t.visit.replace("{rank}", rank), {
    look: seconds(s.firstTapMs ?? 0), throws: fill(t.throws[Math.min(n, 3) - 1] ?? "", { n }), play: seconds(s.playedMs), best: `${best}${NB}m`, share,
  });
  const toSea = () => { window.scrollTo({ top: 0, behavior: "smooth" }); document.querySelector<HTMLElement>(".sea-play")?.focus({ preventScroll: true }); };

  return (
    <section id="read" className="band read">
      <div className="read-say">
        <h2>{say.title}</h2>
        {n > 0 && (
          <p className="lede">
            {visit.split("*").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
          </p>
        )}
        <p className="lede">{say.body}</p>
        <button type="button" className="textlink" onClick={toSea}>{n === 0 ? t.before.button : t.after.button}</button>
      </div>
      <div className="chart">
        <Chart best={best} />
        {best > 0 && <p className="chart-you" style={{ left: `clamp(${PULL / 2}px, ${at(best) * 100}%, 100% - ${PULL / 2}px)` }} data-side={at(best) > 0.8 ? "left" : "right"}>{t.you}, {best} m</p>}
        <ul>
          {DAY.map((d) => <li key={d.name} style={{ left: `${at(d.at) * 100}%` }}><b>{d.name}</b>{d.at} m</li>)}
        </ul>
      </div>
      <p className="note">{t.chart}</p>
    </section>
  );
}
