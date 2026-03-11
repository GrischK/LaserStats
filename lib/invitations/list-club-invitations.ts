import { prisma } from "@/lib/prisma";
import type { ClubInvitationItem } from "./types";

export async function listClubInvitations(params: {
  clubId: string;
  currentUserId: string;
}): Promise<ClubInvitationItem[]> {
  const { clubId, currentUserId } = params;

  const membership = await prisma.membership.findUnique({
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

  const invitations = await prisma.invitation.findMany({
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

  return invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
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