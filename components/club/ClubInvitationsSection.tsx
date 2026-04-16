"use client";

import {useState} from "react";
import InviteMemberForm from "./InviteMemberForm";
import InvitationList from "./InvitationList";
import type {ClubInvitationItem, ClubRole} from "@/lib/types";

type Props = {
  clubId: string;
  availableRoles: ClubRole[];
  initialInvitations: ClubInvitationItem[];
};

export default function ClubInvitationsSection({
                                                 clubId,
                                                 availableRoles,
                                                 initialInvitations,
                                               }: Props) {
  const [invitations, setInvitations] =
    useState<ClubInvitationItem[]>(initialInvitations);

  function handleInvitationCreated(invitation: ClubInvitationItem) {
    setInvitations((prev) => [invitation, ...prev]);
  }

  function handleInvitationCancelled(invitationId: string) {
    setInvitations((prev) => prev.filter((item) => item.id !== invitationId));
  }

  return (
    <div className="sm:space-y-6">
      <InviteMemberForm
        clubId={clubId}
        availableRoles={availableRoles}
        onCreated={handleInvitationCreated}
      />

      <InvitationList
        invitations={invitations}
        onCancelled={handleInvitationCancelled}
      />
    </div>
  );
}
