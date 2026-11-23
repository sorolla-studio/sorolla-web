import Image from "next/image";
import { homeContent } from "@/content/home";

export default function Work() {
  const w = homeContent.work;
  return (
    <section id="work" className="work">
      <div className="band"><h2>{w.title}</h2></div>
      <div className="day"><Image src="/paint/day.webp" alt="One painted sea, from noon on the left to night on the right" width={2000} height={620} sizes="100vw" /></div>
      <ol className="steps">
        {w.steps.map((s) => <li key={s.name}><span className="step-light" aria-hidden="true" /><h3>{s.name}</h3><p>{s.body}</p></li>)}
      </ol>
    </section>
  );
}
