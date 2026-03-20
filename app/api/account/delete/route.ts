import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { del } from "@vercel/blob";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const password = body?.password;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { message: "Mot de passe requis" },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return NextResponse.json(
          { message: "Mot de passe incorrect" },
          { status: 400 }
        );
      }
    }

    if (user.image) {
      try {
        await del(user.image);
      } catch (error) {
        console.error("Erreur suppression avatar Blob:", error);
      }
    }

    await prisma.$transaction([
      prisma.runner.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          userId: null,
        },
      }),
      prisma.user.delete({
        where: {
          id: user.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({ message }, { status: 500 });
  }
}
