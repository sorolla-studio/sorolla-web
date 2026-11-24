/** fill("Best {m} m", { m: 41 }) gives "Best 41 m". */
export const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (all, k) => (k in values ? String(values[k]) : all));

/** A space that never breaks a number from its unit. */
export const NB = "\u{a0}";
