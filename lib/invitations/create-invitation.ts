import { prisma } from "@/lib/prisma";
import type { ClubRole } from "./types";
import { canInviteRole } from "./permissions";
import {
  generateInviteToken,
  getInvitationExpirationDate,
  normalizeEmail,
} from "./utils";
import { sendClubInvitationEmail } from "@/lib/mail";

export async function createInvitation(params: {
  currentUserId: string;
  clubId: string;
  email: string;
  role: ClubRole;
}) {
  const { currentUserId, clubId, email, role } = params;

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
    where: { email: normalizedEmail },
    select: { id: true },
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
    throw new Error("Une invite en attente existe déjà pour cet email");
  }

  const createdInvitation = await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      role,
      token: generateInviteToken(),
      clubId,
      invitedById: currentUserId,
      expiresAt: getInvitationExpirationDate(),
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      expiresAt: true,
      token: true,
      club: {
        select: {
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

  await sendClubInvitationEmail({
    to: createdInvitation.email,
    clubName: createdInvitation.club.name,
    role: createdInvitation.role,
    token: createdInvitation.token,
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${createdInvitation.token}`;

  return {
    id: createdInvitation.id,
    email: createdInvitation.email,
    role: createdInvitation.role,
    status: createdInvitation.status,
    token: createdInvitation.token,
    createdAt: createdInvitation.createdAt,
    expiresAt: createdInvitation.expiresAt,
    invitedBy: createdInvitation.invitedBy,
    inviteUrl,
  };
}