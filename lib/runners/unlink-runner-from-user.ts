import {prisma} from "@/lib/prisma";

export async function unlinkRunnerFromUser(params: {
  currentUserId: string;
  clubId: string;
  runnerId: string;
}) {
  const {currentUserId, clubId, runnerId} = params;

  const currentMembership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: currentUserId,
        clubId,
      },
    },
  });

  if (!currentMembership) {
    throw new Error("Vous n'êtes pas membre de ce club");
  }

  if (currentMembership.role !== "ADMIN" && currentMembership.role !== "COACH") {
    throw new Error("Vous n'avez pas le droit de dissocier un coureur");
  }

  const runner = await prisma.runner.findUnique({
    where: {id: runnerId},
    select: {
      id: true,
      clubId: true,
      userId: true,
      name: true,
    },
  });

  if (!runner || runner.clubId !== clubId) {
    throw new Error("Coureur introuvable dans ce club");
  }

  if (!runner.userId) {
    throw new Error("Ce coureur n'est associé à aucun utilisateur");
  }

  return prisma.runner.update({
    where: {id: runnerId},
    data: {
      userId: null,
    },
    select: {
      id: true,
      name: true,
      userId: true,
    },
  });
}