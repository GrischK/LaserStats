import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function getAuthorizedMembership(clubId: string, userId: string) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId,
        clubId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new Error("Vous n'êtes pas membre de ce club");
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    throw new Error("Vous n'avez pas le droit de gérer les coureurs");
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ clubId: string; runnerId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { clubId, runnerId } = await context.params;
    await getAuthorizedMembership(clubId, session.user.id);

    const body = await req.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ message: "Le nom est requis" }, { status: 400 });
    }

    const runner = await prisma.runner.findUnique({
      where: { id: runnerId },
      select: {
        id: true,
        clubId: true,
        active: true,
      },
    });

    if (!runner || runner.clubId !== clubId || !runner.active) {
      return NextResponse.json({ message: "Coureur introuvable" }, { status: 404 });
    }

    const updatedRunner = await prisma.runner.update({
      where: { id: runnerId },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(updatedRunner);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ clubId: string; runnerId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { clubId, runnerId } = await context.params;
    await getAuthorizedMembership(clubId, session.user.id);

    const runner = await prisma.runner.findUnique({
      where: { id: runnerId },
      select: {
        id: true,
        clubId: true,
        active: true,
      },
    });

    if (!runner || runner.clubId !== clubId || !runner.active) {
      return NextResponse.json({ message: "Coureur introuvable" }, { status: 404 });
    }

    await prisma.runner.update({
      where: { id: runnerId },
      data: {
        active: false,
      },
    });

    return NextResponse.json({ success: true, id: runnerId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ message }, { status: 400 });
  }
}
