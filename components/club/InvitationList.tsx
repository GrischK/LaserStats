"use client";

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
  return (
    <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold">Invitations en attente</h2>

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
    </section>
  );
}
