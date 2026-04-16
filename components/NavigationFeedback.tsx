"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

export default function NavigationFeedback() {
  const pathname = usePathname();
  const [navigationPathname, setNavigationPathname] = useState<string | null>(null);
  const navigating = navigationPathname === pathname;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!link || link.target || link.hasAttribute("download")) {
        return;
      }

      const url = new URL(link.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextPath === currentPath || url.hash && url.pathname === window.location.pathname) {
        return;
      }

      setNavigationPathname(window.location.pathname);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (!navigating) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNavigationPathname(null);
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigating]);

  if (!navigating) {
    return null;
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[120] h-1 overflow-hidden bg-[var(--muted)]">
        <div className="navigation-progress h-full bg-[image:var(--accent-gradient)]"/>
      </div>
      <div className="fixed bottom-4 left-1/2 z-[120] -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--fg)] shadow-[var(--shadow)] sm:hidden">
        Chargement...
      </div>
    </>
  );
}
