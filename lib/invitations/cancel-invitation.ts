import {prisma} from "@/lib/prisma";

export async function cancelInvitation(params: {
  invitationId: string;
  currentUserId: string;
}) {
  const {invitationId, currentUserId} = params;

  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
    select: {
      id: true,
      clubId: true,
      status: true,
    },
  });

  if (!invitation) {
    throw new Error("Invitation introuvable");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: currentUserId,
        clubId: invitation.clubId,
      },
    },
  });

  if (!membership) {
    throw new Error("Vous n'êtes pas membre de ce club");
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    throw new Error("Vous n'avez pas le droit d'annuler cette invite");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Cette invite n'est plus annulable");
  }

  const updatedInvitation = await prisma.invitation.update({
    where: {
      id: invitationId,
    },
    data: {
      status: "CANCELLED",
    },
    select: {
      id: true,
      status: true,
    },
  });

  return updatedInvitation;
}