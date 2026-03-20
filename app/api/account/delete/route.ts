import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { del } from "@vercel/blob";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function validateDeletionPassword(userId: string, password: unknown) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      image: true,
    },
  });

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      ),
    };
  }

  if (user.password) {
    if (!password) {
      return {
        error: NextResponse.json(
          { message: "Mot de passe requis" },
          { status: 400 }
        ),
      };
    }

    const valid = await bcrypt.compare(String(password), user.password);

    if (!valid) {
      return {
        error: NextResponse.json(
          { message: "Mot de passe incorrect" },
          { status: 400 }
        ),
      };
    }
  }

  return { user };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const password = body?.password;

    const { error } = await validateDeletionPassword(session.user.id, password);

    if (error) {
      return error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const password = body?.password;
    const result = await validateDeletionPassword(session.user.id, password);

    if (result.error) {
      return result.error;
    }

    const user = result.user;

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
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
