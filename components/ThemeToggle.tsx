"use client";

import {useEffect, useState} from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
      setTheme(savedTheme);
    } else {
      document.documentElement.dataset.theme = "dark";
      setTheme("dark");
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-full border border-[var(--border)] px-3 py-2 text-sm"
      >
        ...
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--muted)]"
    >
      {theme === "dark" ? "☀️ Clair" : "🌙 Sombre"}
    </button>
  );
}