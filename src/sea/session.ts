"use client";

import { useSyncExternalStore } from "react";

/** What one visit to the sea looked like. Lives in memory only; nothing is sent. */
export type Session = {
  openedAt: number;
  firstTapMs: number | null;
  playedMs: number;
  runs: { metres: number; skips: number; perfects: number; light: string; ms: number }[];
};

const empty: Session = { openedAt: 0, firstTapMs: null, playedMs: 0, runs: [] };
let state: Session = empty;
const listeners = new Set<() => void>();

const set = (next: Partial<Session>) => { state = { ...state, ...next }; listeners.forEach((l) => l()); };

export const session = {
  open() { if (!state.openedAt) set({ openedAt: performance.now() }); },
  firstTap() { if (state.firstTapMs === null) set({ firstTapMs: performance.now() - state.openedAt }); },
  run(r: Session["runs"][number]) { set({ runs: [...state.runs, r], playedMs: state.playedMs + r.ms }); },
  get best() { return state.runs.reduce((b, r) => Math.max(b, r.metres), 0); },
};

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useSession = () => useSyncExternalStore(subscribe, () => state, () => empty);
