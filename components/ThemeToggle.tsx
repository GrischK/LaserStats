"use client";

import {useSyncExternalStore} from "react";
import {applyTheme, getThemeServerSnapshot, getThemeSnapshot, subscribeTheme, Theme,} from "@/lib/theme";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  const icon = theme === "dark" ? "☀️" : "🌙";
  const label = theme === "dark" ? "Clair" : "Sombre";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Passer en mode ${label.toLowerCase()}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--muted)]"
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
