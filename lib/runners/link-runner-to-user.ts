import {prisma} from "@/lib/prisma";

export async function linkRunnerToUser(params: {
  currentUserId: string;
  clubId: string;
  runnerId: string;
  userId: string;
}) {
  const {currentUserId, clubId, runnerId, userId} = params;

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
    throw new Error("Vous n'avez pas le droit d'associer un coureur");
  }

  const targetMembership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId,
        clubId,
      },
    },
  });

  if (!targetMembership) {
    throw new Error("Cet utilisateur n'appartient pas au club");
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

  if (runner.userId) {
    throw new Error("Ce coureur est déjà associé à un utilisateur");
  }

  const existingRunnerForUser = await prisma.runner.findFirst({
    where: {
      clubId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (existingRunnerForUser) {
    throw new Error("Cet utilisateur est déjà associé à un coureur");
  }

  const updatedRunner = await prisma.runner.update({
    where: {id: runnerId},
    data: {userId},
    select: {
      id: true,
      name: true,
      userId: true,
    },
  });

  return updatedRunner;
}