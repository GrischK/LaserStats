export const scoreButtonClasses = {
  0: "bg-[var(--score-0)] text-[var(--score-0-foreground)]",
  1: "bg-[var(--score-1)] text-[var(--score-1-foreground)]",
  2: "bg-[var(--score-2)] text-[var(--score-2-foreground)]",
  3: "bg-[var(--score-3)] text-[var(--score-3-foreground)]",
  4: "bg-[var(--score-4)] text-[var(--score-4-foreground)]",
  5: "bg-[var(--score-5)] text-[var(--score-5-foreground)]",
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
