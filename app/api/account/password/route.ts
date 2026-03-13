import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcrypt";
import {getAuthSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({message: "Non autorisé"}, {status: 401});
    }

    const body = await req.json();

    const currentPassword = body?.currentPassword;
    const newPassword = body?.newPassword;
    const confirmPassword = body?.confirmPassword;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        {message: "Nouveau mot de passe requis"},
        {status: 400}
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {message: "Les mots de passe ne correspondent pas"},
        {status: 400}
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {message: "Le mot de passe doit contenir au moins 6 caractères"},
        {status: 400}
      );
    }

    const user = await prisma.user.findUnique({
      where: {id: session.user.id},
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {message: "Utilisateur introuvable"},
        {status: 404}
      );
    }

    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          {message: "Mot de passe actuel requis"},
          {status: 400}
        );
      }

      const valid = await bcrypt.compare(currentPassword, user.password);

      if (!valid) {
        return NextResponse.json(
          {message: "Mot de passe actuel incorrect"},
          {status: 400}
        );
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {id: session.user.id},
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({success: true});
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 500});
  }
}