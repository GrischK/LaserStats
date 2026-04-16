export const scoreButtonClasses = {
  0: "bg-[image:var(--score-0-gradient)] text-[var(--score-0-foreground)]",
  1: "bg-[image:var(--score-1-gradient)] text-[var(--score-1-foreground)]",
  2: "bg-[image:var(--score-2-gradient)] text-[var(--score-2-foreground)]",
  3: "bg-[image:var(--score-3-gradient)] text-[var(--score-3-foreground)]",
  4: "bg-[image:var(--score-4-gradient)] text-[var(--score-4-foreground)]",
  5: "bg-[image:var(--score-5-gradient)] text-[var(--score-5-foreground)]",
} as const;

export const scoreTextClasses = {
  0: "text-[var(--score-0)]",
  1: "text-[var(--score-1)]",
  2: "text-[var(--score-2)]",
  3: "text-[var(--score-3)]",
  4: "text-[var(--score-4)]",
  5: "text-[var(--score-5)]",
} as const;

export type ScoreValue = keyof typeof scoreButtonClasses;

export function getScoreButtonClass(score: number) {
  return scoreButtonClasses[score as ScoreValue] ?? scoreButtonClasses[0];
}

export function getScoreTextClass(score: number) {
  return scoreTextClasses[score as ScoreValue] ?? scoreTextClasses[0];
}
