"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState, useSyncExternalStore} from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import {getThemeServerSnapshot, getThemeSnapshot, subscribeTheme,} from "@/lib/theme";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({children}: Props) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const isAuthPage =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/api/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  const logo = theme === "light" ? "/logo.png" : "/logo-dark.png";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-20">
                <img src={logo} alt="logo" className="w-full"/>
              </div>
            </Link>

            <div>
              <div className="text-lg font-bold tracking-tight">Laser-stats</div>
              <div className="hidden text-xs text-[var(--muted-foreground)] sm:block">
                Suivi des tirs Laser Run
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/account"
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
            >
              Compte
            </Link>
            <LogoutButton/>
            <ThemeToggle/>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] p-2 text-[var(--fg)] transition hover:bg-[var(--muted)] md:hidden"
          >
            <span className="sr-only">
              {mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
            <div className="flex h-5 w-5 flex-col items-center justify-center gap-1">
              <span
                className={`block h-0.5 w-5 rounded bg-current transition-all ${
                  mobileMenuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded bg-current transition-all ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded bg-current transition-all ${
                  mobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-[var(--border)] bg-[var(--header-bg)] md:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
              >
                Accueil
              </Link>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
              >
                Compte
              </Link>

              <div className="flex items-center justify-between rounded-xl px-3 py-2">
                <ThemeToggle/>
              </div>

              <div className="px-3 py-2">
                <LogoutButton/>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}