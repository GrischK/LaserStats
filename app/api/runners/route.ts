import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const membership = user.memberships.find(
    (m: { clubId: string; role: string }) => m.clubId === clubId
  );

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const runners = await prisma.runner.findMany({
    where: {
      clubId,
      active: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(runners);
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body?.name ?? "").trim();
  const clubId = String(body?.clubId ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  if (!clubId) {
    return NextResponse.json({ error: "Le club est requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const membership = user.memberships.find(
    (m: { clubId: string; role: string }) => m.clubId === clubId
  );

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  }

  const runner = await prisma.runner.create({
    data: {
      name,
      clubId,
    },
  });

  return NextResponse.json(runner, { status: 201 });
}