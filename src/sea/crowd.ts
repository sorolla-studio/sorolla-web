import { simulate } from "./rules";
import { mulberry } from "./strokes";

const N = 500, THROWS = 3;

/** Best of a few throws for each simulated player, on the same rules the visitor plays. Same crowd for everyone. */
let cached: number[] | null = null;
export function crowd(): number[] {
  if (cached) return cached;
  const r = mulberry(1863);
  cached = Array.from({ length: N }, () => Math.max(...Array.from({ length: THROWS }, () => simulate(r).metres))).sort((a, b) => a - b);
  return cached;
}

/** How many of a hundred simulated players you beat. */
export const beats = (metres: number) => Math.round((crowd().filter((m) => m < metres).length / N) * 100);
