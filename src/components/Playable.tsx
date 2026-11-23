"use client";

import Image from "next/image";
import { useState } from "react";
import type { Game } from "@/content/games";
import { homeContent } from "@/content/home";

/** The game's own playable ad, loaded only when asked for. */
export default function Playable({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);
  const [w, h] = game.size;
  if (open) {
    return (
      <div className="playable is-open">
        <iframe src={game.playable} title={game.name} style={{ aspectRatio: `${w} / ${h}` }} allow="autoplay; fullscreen" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" />
        <button type="button" className="textlink" onClick={() => setOpen(false)}>{homeContent.games.close}</button>
      </div>
    );
  }
  return (
    <button type="button" className="playable canvas" onClick={() => setOpen(true)}>
      <Image src={`/games/${game.slug}.webp`} alt={game.name} width={w} height={h} sizes="(max-width: 760px) 92vw, 42vw" />
      <span className="button">{homeContent.games.play}</span>
    </button>
  );
}
