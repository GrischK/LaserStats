"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import BrutalButton from "@/components/BrutalButton";
import { useOutsideClick } from "@/lib/use-outside-click";

type Props = {
  clubId: string;
};

export default function ClubActionsDropdown({ clubId }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(rootRef, () => setOpen(false), open);

  return (
    <div ref={rootRef} className="relative">
      <BrutalButton
        type="button"
        label={open ? "Fermer" : "Gérer le club"}
        onClickFn={() => setOpen((prev) => !prev)}
        variant="secondary"
        fullWidth
      />

      <div
        className={`absolute left-1/2 z-30 mt-3 flex w-72 -translate-x-1/2 origin-top flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)] transition-all duration-200 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <Link
          href={`/clubs/${clubId}/settings`}
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-3 text-sm font-semibold transition hover:bg-[var(--muted)]"
        >
          Inviter un membre
        </Link>

        <Link
          href={`/clubs/${clubId}/associations`}
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-3 text-sm font-semibold transition hover:bg-[var(--muted)]"
        >
          Gérer les associations
        </Link>

        <Link
          href={`/clubs/${clubId}/manage-runners`}
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-3 text-sm font-semibold transition hover:bg-[var(--muted)]"
        >
          Gérer les coureurs
        </Link>
      </div>
    </div>
  );
}
