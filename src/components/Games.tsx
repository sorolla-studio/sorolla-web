import Image from "next/image";
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
  return (
    <section id="games" className="band">
      <h2>{homeContent.games.title}</h2>
      <div className="wall">
        {games.map((g, i) => (
          <figure key={g.slug} className={`hang is-${i ? g.slug : "lead"}`}>
            <a href={g.appStore} target="_blank" rel="noopener noreferrer" className="canvas" tabIndex={-1} aria-hidden="true">
              <Image src={`/games/${g.slug}.webp`} alt="" width={g.size[0]} height={g.size[1]} sizes={i ? "(max-width: 760px) 60vw, 34vw" : "(max-width: 760px) 92vw, 42vw"} />
            </a>
            <Label game={g} />
          </figure>
        ))}
      </div>
    </section>
  );
}
