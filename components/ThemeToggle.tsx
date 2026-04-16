"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, getThemeServerSnapshot, getThemeSnapshot, subscribeTheme, Theme, } from "@/lib/theme";
import BrutalButton from "@/components/BrutalButton";

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
    <BrutalButton
      type="button"
      aria-label={`Passer en mode ${label.toLowerCase()}`}
      title="Modifier"
      onClickFn={toggleTheme}
      variant="soft"
      className="h-11 min-h-11 w-11 p-0 sm:col-span-1"
    >
      <span aria-hidden="true">{icon}</span>
      {/*<span className="hidden sm:inline">{label}</span>*/}
    </BrutalButton>
  );
}
