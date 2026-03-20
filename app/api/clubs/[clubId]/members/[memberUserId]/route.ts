import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ clubId: string; memberUserId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { clubId, memberUserId } = await context.params;

    const actorMembership = await prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId: session.user.id,
          clubId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!actorMembership) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    if (actorMembership.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Seul un admin peut retirer un membre" },
        { status: 403 }
      );
    }

    if (memberUserId === session.user.id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas vous retirer vous-même du club ici" },
        { status: 400 }
      );
    }

    const targetMembership = await prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId: memberUserId,
          clubId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!targetMembership) {
      return NextResponse.json({ message: "Membre introuvable" }, { status: 404 });
    }

    if (targetMembership.role === "ADMIN") {
      const adminCount = await prisma.membership.count({
        where: {
          clubId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "Impossible de retirer le dernier admin du club" },
          { status: 400 }
        );
      }
    }

    await prisma.membership.delete({
      where: {
        userId_clubId: {
          userId: memberUserId,
          clubId,
        },
      },
    });

    return NextResponse.json({ success: true, userId: memberUserId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ message }, { status: 500 });
  }
}
