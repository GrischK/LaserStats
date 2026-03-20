"use client";

import Link from "next/link";
import { useState } from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  clubId: string;
};

export default function ClubActionsDropdown({ clubId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <BrutalButton
        type="button"
        label={open ? "Fermer" : "Gérer le club"}
        onClickFn={() => setOpen((prev) => !prev)}
      />

      {open ? (
        <div className="absolute left-1/2 z-30 mt-3 flex w-72 -translate-x-1/2 flex-col gap-4 justify-center items-center p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
          <Link
            href={`/clubs/${clubId}/settings`}
            onClick={() => setOpen(false)}
          >
            <BrutalButton
              type="button"
              label={"Inviter un membre"}
            />
          </Link>

          <Link
            href={`/clubs/${clubId}/associations`}
            onClick={() => setOpen(false)}
          >
            <BrutalButton
              type="button"
              label={"Gérer les associations"}
            />
          </Link>

          <Link
            href={`/clubs/${clubId}/manage-runners`}
            onClick={() => setOpen(false)}
          >
            <BrutalButton
              type="button"
              label={"Gérer les coureurs"}
            />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
