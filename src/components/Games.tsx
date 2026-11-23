import Image from "next/image";
import Playable from "./Playable";
import { games, type Game } from "@/content/games";
import { homeContent } from "@/content/home";

function Label({ game }: { game: Game }) {
  return (
    <figcaption>
      <h3>{game.name}</h3>
      <p>{game.line}</p>
      <p className="stores">
        <a href={game.appStore} target="_blank" rel="noopener noreferrer">App Store</a>
        {game.googlePlay && <a href={game.googlePlay} target="_blank" rel="noopener noreferrer">Google Play</a>}
      </p>
    </figcaption>
  );
}

export default function Games() {
  const [lead, ...rest] = games;
  return (
    <section id="games" className="band">
      <h2>{homeContent.games.title}</h2>
      <div className="wall">
        <figure className="hang is-lead">
          <Playable game={lead} />
          <Label game={lead} />
        </figure>
        {rest.map((g) => (
          <figure key={g.slug} className={`hang is-${g.slug}`}>
            <a href={g.appStore} target="_blank" rel="noopener noreferrer" className="canvas" tabIndex={-1} aria-hidden="true">
              <Image src={`/games/${g.slug}.webp`} alt="" width={g.size[0]} height={g.size[1]} sizes="(max-width: 760px) 60vw, 34vw" />
            </a>
            <Label game={g} />
          </figure>
        ))}
      </div>
    </section>
  );
}
