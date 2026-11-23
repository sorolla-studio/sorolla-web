"use client";

import { useEffect, useRef, useState } from "react";
import { World } from "@/sea/world";
import { session } from "@/sea/session";

type Result = { metres: number; skips: number; best: number; light: string; fresh: boolean };
type Phase = "still" | "poster" | "idle" | "run" | "over";

const MUTE_KEY = "sorolla-muted";
/** Metres after which the sky is dark enough for light lettering. */
const DARK_SKY = 520;

type Words = { throw: string; time: string; again: string; read: string; sank: string };

export default function Sea({ words, children }: { words: Words; children?: React.ReactNode }) {
  const sea = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<World | null>(null);
  const metres = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const [phase, setPhase] = useState<Phase>("still");
  const [throws, setThrows] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    session.open();
    let w: World | null = null, failed = false;
    const build = () => {
      try {
        w = new World(el, {
          metres: (m) => {
            if (metres.current) metres.current.textContent = String(Math.round(m));
            if (sea.current) sea.current.dataset.sky = m > DARK_SKY ? "dark" : "light";
          },
          say: (text, tone) => {
            const n = word.current;
            if (!n) return;
            n.textContent = text; n.dataset.tone = tone;
            n.getAnimations().forEach((a) => a.cancel());
            n.animate(
              [{ opacity: 0, transform: "translateY(14px) scale(.7)" }, { opacity: 1, transform: "translateY(0) scale(1.12)", offset: 0.22 }, { opacity: 1, transform: "translateY(-2px) scale(1)", offset: 0.55 }, { opacity: 0, transform: "translateY(-18px) scale(.98)" }],
              { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
            );
          },
          state: (s, r) => {
            setPhase(s);
            if (r) setResult(r);
            if (s === "run") setThrows((n) => n + 1);
            if (s === "idle" && sea.current) sea.current.dataset.sky = "light";
          },
          firstTap: () => session.firstTap(),
          ran: (r) => session.run(r),
        }, { reduced: matchMedia("(prefers-reduced-motion: reduce)").matches });
      } catch (e) {
        console.warn("The sea needs WebGL2; showing the still painting.", e);
        failed = true;
        setPhase("poster");
        return;
      }
      world.current = w;
      let saved = false;
      try { saved = localStorage.getItem(MUTE_KEY) === "1"; } catch {}
      w.audio.setMuted(saved); setMuted(saved);
      setPhase("idle");
    };
    const io = new IntersectionObserver(([e]) => {
      if (!w && !failed && e.isIntersecting) build();
      w?.setSeen(e.isIntersecting);
    }, { threshold: 0.05 });
    io.observe(el);
    const onVis = () => w?.setSeen(!document.hidden && el.getBoundingClientRect().bottom > 0);
    const ro = new ResizeObserver(() => w?.resize());
    ro.observe(el);
    const onKey = (e: KeyboardEvent) => {
      const on = document.activeElement;
      const onSea = on === document.body || on?.classList.contains("sea-play");
      if ((e.code !== "Space" && e.code !== "Enter") || !w?.playing || e.repeat || !onSea) return;
      e.preventDefault(); w.tap();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("keydown", onKey, true);
    return () => {
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey, true);
      w?.destroy(); world.current = null;
    };
  }, []);

  const toggle = () => {
    const m = !muted;
    setMuted(m); world.current?.audio.setMuted(m);
    try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch {}
  };

  return (
    <div ref={sea} className="sea" data-phase={phase} data-sky="light">
      <div ref={host} className="sea-paint" />
      <button
        type="button"
        className="sea-play"
        aria-label={phase === "run" ? "Tap when the stone meets the water" : "Skip a stone across the sea"}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          world.current?.point(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
        }}
        onPointerDown={(e) => { if (world.current?.playing) { e.currentTarget.dataset.took = "1"; world.current.tap(); } }}
        onClick={(e) => {
          // a press that already skipped the stone is not also a new throw
          if (e.currentTarget.dataset.took) { delete e.currentTarget.dataset.took; return; }
          if (!world.current?.playing) world.current?.tap();
        }}
      />
      <div className="sea-hud" aria-hidden={phase !== "run"}>
        <p className="sea-metres"><span ref={metres}>0</span><small>m</small></p>
        <p className="sea-word" ref={word} />
      </div>
      {(phase === "idle" || phase === "over" || (phase === "run" && throws === 1)) && (
        <p className="sea-cue" key={phase} aria-hidden="true"><span className="swipe">{phase === "idle" ? words.throw : phase === "over" ? words.again : words.time}</span></p>
      )}
      <div className="sea-over" aria-live="polite">
        {phase === "over" && result && (
          <div className="sea-card">
            <p className="sea-total">{result.metres}<small>m</small></p>
            <p className="sea-how">
              {result.skips === 0 ? words.sank : (
                <>{result.skips} {result.skips === 1 ? "skip" : "skips"}{result.light === "noon" ? ". Still noon." : `, noon to ${result.light}.`} {result.fresh ? "Your best." : `Your best is ${result.best} m.`}</>
              )}
            </p>
            <a className="textlink" href="#read">{words.read}</a>
          </div>
        )}
      </div>
      <button type="button" className="sea-sound" onClick={toggle} aria-pressed={!muted} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
          {muted ? <path d="M16 9.5l5 5m0-5l-5 5" /> : <path d="M15.5 9a4.2 4.2 0 010 6M18.3 6.5a8 8 0 010 11" />}
        </svg>
      </button>
      {children}
    </div>
  );
}
