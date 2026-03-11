"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({children}: Props) {
  const pathname = usePathname();

  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/api/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
            >
              <span className="text-base">🏠</span>
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            <div>
              <div className="text-lg font-bold tracking-tight">LaserStats</div>
              <div className="hidden text-xs text-[var(--muted-foreground)] sm:block">
                Suivi des tirs Laser Run
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
            >
              Compte
            </Link>

            <ThemeToggle/>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}