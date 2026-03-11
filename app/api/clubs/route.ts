import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const body = await request.json();
  const name = String(body?.name ?? "").trim();

  if (!name) {
    return NextResponse.json({error: "Le nom du club est requis"}, {status: 400});
  }

  const user = await prisma.user.findUnique({
    where: {email: session.user.email},
  });

  if (!user) {
    return NextResponse.json({error: "Utilisateur introuvable"}, {status: 404});
  }

  const club = await prisma.club.create({
    data: {
      name,
      memberships: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json(club, {status: 201});
}