"use client";

import {useState} from "react";
import {ChevronDown} from "lucide-react";
import InvitationRow from "./InvitationRow";
import type {ClubInvitationItem} from "@/lib/types";

type Props = {
  invitations: ClubInvitationItem[];
  onCancelled: (invitationId: string) => void;
};

export default function InvitationList({
                                         invitations,
                                         onCancelled,
                                       }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invitations en attente</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {invitations.length} invitation{invitations.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--fg)]">
          <ChevronDown
            size={22}
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-4 sm:space-y-3">
            {invitations.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Aucune invitation en attente.
              </p>
            ) : (
              invitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onCancelled={onCancelled}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
