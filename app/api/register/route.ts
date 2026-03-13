import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcrypt";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = body?.name?.trim() || null;
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        {message: "Email et mot de passe requis"},
        {status: 400}
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {message: "Le mot de passe doit contenir au moins 6 caractères"},
        {status: 400}
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {email},
      select: {id: true},
    });

    if (existingUser) {
      return NextResponse.json(
        {message: "Un compte existe déjà avec cet email"},
        {status: 400}
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(user, {status: 201});
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 500});
  }
}