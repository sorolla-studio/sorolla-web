// Skipping a stone. Pure rules: no DOM, no drawing, so the visitor and the simulated crowd play
// exactly the same game.
export const RULES = {
  hopMax: 1.0, hopMin: 0.37,        // seconds in the air at full and at no energy
  firstHop: 0.85,
  perfect: 0.055, good: 0.125,      // seconds either side of the touch
  speedMax: 13.5, speedMin: 7.5,    // metres per second
  gainPerfect: 0.035, lossGood: 0.075, lossPoor: 0.25,
  wear: 0.0032,                     // the best possible hop shortens with every skip
  gravity: 5.4,
};

export type Hit = "perfect" | "good" | "poor";

export class Run {
  t = 0;
  hop = RULES.firstHop;
  energy = 1;
  metres = 0;
  skips = 0;
  perfects = 0;
  streak = 0;
  over = false;
  /** how far from the touch the last tap was, in seconds; negative is early */
  lastOffset = 0;
  private queued: Hit | null = null;

  get speed() { return RULES.speedMin + (RULES.speedMax - RULES.speedMin) * this.energy; }

  /** Height of the stone, 0 at the water. The first arc leaves the hand. */
  get height() {
    const u = Math.min(1, this.t / this.hop);
    const arc = (RULES.gravity * this.hop * this.hop) / 8 * 4 * u * (1 - u);
    return this.skips === 0 ? 0.5 * (1 - u) + arc * 0.5 : arc;
  }

  /** A tap is already in for this touch. */
  get tapped() { return this.queued !== null; }

  /** Seconds until the stone touches the water; negative once it has. */
  get untilTouch() { return this.hop - this.t; }

  tap(): Hit | null {
    if (this.over || this.queued) return null;
    const off = this.t - this.hop;
    this.lastOffset = off;
    const d = Math.abs(off);
    const hit: Hit = d <= RULES.perfect ? "perfect" : d <= RULES.good ? "good" : "poor";
    this.queued = hit;
    return hit;
  }

  /** Advances time. Returns the skip that happened in this step, if any. */
  step(dt: number): Hit | null {
    if (this.over) return null;
    this.t += dt;
    this.metres += this.speed * dt;
    if (this.queued && this.t >= this.hop) {
      const hit = this.queued;
      this.queued = null;
      return this.skip(hit);
    }
    if (this.t > this.hop + RULES.good) this.over = true;
    return null;
  }

  private skip(hit: Hit): Hit {
    this.skips++;
    if (hit === "perfect") { this.perfects++; this.streak++; this.energy += RULES.gainPerfect; }
    else { this.streak = 0; this.energy -= hit === "good" ? RULES.lossGood : RULES.lossPoor; }
    this.energy = Math.min(1 - this.skips * RULES.wear, this.energy);
    if (this.energy <= 0) { this.energy = 0; this.over = true; }
    this.t = 0;
    this.hop = RULES.hopMin + (RULES.hopMax - RULES.hopMin) * this.energy;
    return hit;
  }
}

/** One simulated player: timing error is normal around a personal bias, with the odd lapse. */
export function simulate(rand: () => number) {
  const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const spread = 0.045 * Math.exp(normal() * 0.42);
  const bias = normal() * 0.03;
  const lapse = 0.015 + rand() * 0.05;
  const run = new Run();
  while (!run.over && run.skips < 400) {
    const missed = rand() < lapse;
    const at = run.hop + bias + normal() * spread;
    if (missed || at > run.hop + RULES.good) { run.step(run.hop + RULES.good + 0.001 - run.t); break; }
    run.step(Math.max(0, at - run.t - 1e-6));
    run.tap();
    run.step(Math.max(0.0005, run.hop - run.t + 1e-6));
  }
  return { metres: run.metres, skips: run.skips };
}
