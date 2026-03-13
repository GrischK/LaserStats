import {NextRequest, NextResponse} from "next/server";
import {getAuthSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({message: "Non autorisé"}, {status: 401});
    }

    const body = await req.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const image =
      typeof body?.image === "string" ? body.image.trim() : "";

    if (!email) {
      return NextResponse.json(
        {message: "Email requis"},
        {status: 400}
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {email},
      select: {id: true},
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        {message: "Cet email est déjà utilisé"},
        {status: 400}
      );
    }

    const updatedUser = await prisma.user.update({
      where: {id: session.user.id},
      data: {
        name: name || null,
        email,
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 500});
  }
}