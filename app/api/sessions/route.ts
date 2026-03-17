import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

function getStartOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const runnerId = String(body?.runnerId ?? "").trim();
  const distanceRaw = body?.distance;
  const targetsHit = Number(body?.targetsHit);

  if (!runnerId) {
    return NextResponse.json({ error: "runnerId is required" }, { status: 400 });
  }

  if (!Number.isInteger(targetsHit) || targetsHit < 0 || targetsHit > 5) {
    return NextResponse.json(
      { error: "targetsHit must be an integer between 0 and 5" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const runner = await prisma.runner.findUnique({
    where: { id: runnerId },
  });

  if (!runner) {
    return NextResponse.json({ error: "Runner not found" }, { status: 404 });
  }

  const membership = user.memberships.find(
    (m: { clubId: string; role: string }) => m.clubId === runner.clubId
  );

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  }

  const distance =
    distanceRaw === "" || distanceRaw == null ? null : Number(distanceRaw);

  if (distance !== null && (!Number.isInteger(distance) || distance < 0)) {
    return NextResponse.json({ error: "Invalid distance" }, { status: 400 });
  }

  const durationSeconds =
    body?.durationSeconds === null || body?.durationSeconds === ""
      ? null
      : Number(body?.durationSeconds);

  if (
    durationSeconds !== null &&
    (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 50)
  ) {
    return NextResponse.json(
      { error: "durationSeconds must be an integer between 0 and 50" },
      { status: 400 }
    );
  }

  const shotSession = await prisma.shotSession.create({
    data: {
      runnerId,
      distance,
      targetsHit,
      durationSeconds,
      sessionDay: getStartOfDay(),
    },
  });

  return NextResponse.json(shotSession, { status: 201 });
}
