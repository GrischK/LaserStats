import {prisma} from "@/lib/prisma";
import type {ClubInvitationItem, InvitationListItem, Membership} from "@/lib/types";

export async function listClubInvitations(params: {
  clubId: string;
  currentUserId: string;
}): Promise<ClubInvitationItem[]> {
  const {clubId, currentUserId} = params;

  const membership: Membership | null = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: currentUserId,
        clubId,
      },
    },
  });

  if (!membership) {
    throw new Error("Vous n'êtes pas membre de ce club");
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    throw new Error("Vous n'avez pas accès aux invitations");
  }

  const invitations: InvitationListItem[] = await prisma.invitation.findMany({
    where: {
      clubId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      token: true,
      createdAt: true,
      expiresAt: true,
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return invitations.map((invitation: InvitationListItem) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    token: invitation.token,
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
    invitedBy: invitation.invitedBy
      ? {
        id: invitation.invitedBy.id,
        name: invitation.invitedBy.name,
        email: invitation.invitedBy.email,
      }
      : null,
  }));
}