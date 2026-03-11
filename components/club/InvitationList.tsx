"use client";

import InvitationRow from "./InvitationRow";
import type {ClubInvitationItem} from "@/lib/invitations/types";

type Props = {
  invitations: ClubInvitationItem[];
  onCancelled: (invitationId: string) => void;
};

export default function InvitationList({
                                         invitations,
                                         onCancelled,
                                       }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">Invitations en attente</h2>

      <div className="mt-4 space-y-3">
        {invitations.length === 0 ? (
          <p className="text-sm text-neutral-500">
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
  );
}