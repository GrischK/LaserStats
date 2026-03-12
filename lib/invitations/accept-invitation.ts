import {prisma} from "@/lib/prisma";

export async function acceptInvitation(params: {
  token: string;
  currentUserId: string;
}) {
  const {token, currentUserId} = params;

  const user = await prisma.user.findUnique({
    where: {id: currentUserId},
    select: {
      id: true,
      email: true,
    },
  });

  if (!user || !user.email) {
    throw new Error("Utilisateur introuvable");
  }

  const invitation = await prisma.invitation.findUnique({
    where: {token},
    include: {
      club: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  console.log("SESSION USER EMAIL:", user.email);
  console.log("INVITATION EMAIL:", invitation.email);

  if (!invitation) {
    throw new Error("Invitation introuvable");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Cette invite n'est plus valide");
  }

  if (invitation.expiresAt.getTime() < Date.now()) {
    await prisma.invitation.update({
      where: {id: invitation.id},
      data: {status: "EXPIRED"},
    });

    throw new Error("Cette invite a expiré");
  }

  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("Cette invitation est liée à une autre adresse email");
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: currentUserId,
        clubId: invitation.clubId,
      },
    },
  });

  if (existingMembership) {
    throw new Error("Vous êtes déjà membre de ce club");
  }

  await prisma.$transaction([
    prisma.membership.create({
      data: {
        userId: currentUserId,
        clubId: invitation.clubId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: {id: invitation.id},
      data: {
        status: "ACCEPTED",
        acceptedById: currentUserId,
      },
    }),
  ]);

  return {
    clubId: invitation.clubId,
    clubName: invitation.club.name,
    role: invitation.role,
  };
}