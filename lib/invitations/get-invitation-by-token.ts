import { prisma } from "@/lib/prisma";
import type { InvitationDetails, InvitationStatus } from "@/lib/types";

export async function getInvitationByToken(
  token: string
): Promise<InvitationDetails | null> {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      club: {
        select: {
          id: true,
          name: true,
        },
      },
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return null;
  }

  let computedStatus: InvitationStatus = invitation.status;

  if (
    invitation.status === "PENDING" &&
    invitation.expiresAt.getTime() < Date.now()
  ) {
    computedStatus = "EXPIRED";
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: computedStatus,
    expiresAt: invitation.expiresAt,
    club: {
      id: invitation.club.id,
      name: invitation.club.name,
    },
    invitedBy: {
      id: invitation.invitedBy.id,
      name: invitation.invitedBy.name,
      email: invitation.invitedBy.email,
    },
  };
}