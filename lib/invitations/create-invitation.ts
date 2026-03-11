import {prisma} from "@/lib/prisma";
import type {ClubRole} from "./types";
import {canInviteRole} from "./permissions";
import {generateInviteToken, getInvitationExpirationDate, normalizeEmail,} from "./utils";

export async function createInvitation(params: {
  currentUserId: string;
  clubId: string;
  email: string;
  role: ClubRole;
}) {
  const {currentUserId, clubId, email, role} = params;

  const normalizedEmail = normalizeEmail(email);

  const inviterMembership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: currentUserId,
        clubId,
      },
    },
  });

  if (!inviterMembership) {
    throw new Error("Vous n'êtes pas membre de ce club");
  }

  if (!canInviteRole(inviterMembership.role, role)) {
    throw new Error("Vous n'avez pas le droit d'inviter ce rôle");
  }

  const existingUser = await prisma.user.findUnique({
    where: {email: normalizedEmail},
    select: {id: true},
  });

  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId: existingUser.id,
          clubId,
        },
      },
    });

    if (existingMembership) {
      throw new Error("Cet utilisateur est déjà membre du club");
    }
  }

  const existingPendingInvitation = await prisma.invitation.findFirst({
    where: {
      clubId,
      email: normalizedEmail,
      status: "PENDING",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (existingPendingInvitation) {
    throw new Error("Une invitation en attente existe déjà pour cet email");
  }

  const invitation = await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      role,
      token: generateInviteToken(),
      clubId,
      invitedById: currentUserId,
      expiresAt: getInvitationExpirationDate(),
    },
    include: {
      club: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return invitation;
}