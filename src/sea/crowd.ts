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

/** How many of a hundred simulated players you beat: 0 only for none of them, 100 only for all. */
export function beats(metres: number) {
  const share = crowd().filter((m) => m < metres).length / N;
  return share === 0 || share === 1 ? share * 100 : Math.min(99, Math.max(1, Math.round(share * 100)));
}
