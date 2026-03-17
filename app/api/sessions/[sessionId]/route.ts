import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";

type Props = {
  params: Promise<{ sessionId: string }>;
};

export async function PATCH(request: Request, {params}: Props) {
  const {sessionId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const body = await request.json();

  const distanceRaw = body?.distance;
  const targetsHit = Number(body?.targetsHit);
  const durationSecondsRaw = body?.durationSeconds;

  if (!Number.isInteger(targetsHit) || targetsHit < 0 || targetsHit > 5) {
    return NextResponse.json(
      {error: "targetsHit must be an integer between 0 and 5"},
      {status: 400}
    );
  }

  const user = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {memberships: true},
  });

  if (!user) {
    return NextResponse.json({error: "User not found"}, {status: 404});
  }

  const existingShotSession = await prisma.shotSession.findUnique({
    where: {id: sessionId},
    include: {
      runner: true,
    },
  });

  if (!existingShotSession) {
    return NextResponse.json({error: "Session not found"}, {status: 404});
  }

  const membership = user.memberships.find(
    (m: { clubId: string; role: string }) =>
      m.clubId === existingShotSession.runner.clubId
  );

  if (!membership) {
    return NextResponse.json({error: "Forbidden"}, {status: 403});
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    return NextResponse.json({error: "Insufficient role"}, {status: 403});
  }

  const distance =
    distanceRaw === "" || distanceRaw == null ? null : Number(distanceRaw);

  if (distance !== null && !Number.isFinite(distance)) {
    return NextResponse.json({error: "Invalid distance"}, {status: 400});
  }

  const durationSeconds =
    durationSecondsRaw === "" || durationSecondsRaw == null
      ? null
      : Number(durationSecondsRaw);

  if (
    durationSeconds !== null &&
    (!Number.isInteger(durationSeconds) ||
      durationSeconds < 0 ||
      durationSeconds > 50)
  ) {
    return NextResponse.json(
      {error: "durationSeconds must be an integer between 0 and 50"},
      {status: 400}
    );
  }

  const updatedShotSession = await prisma.shotSession.update({
    where: {id: sessionId},
    data: {
      distance,
      targetsHit,
      durationSeconds,
    },
  });

  return NextResponse.json(updatedShotSession);
}

export async function DELETE(_: Request, {params}: Props) {
  const {sessionId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const user = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {memberships: true},
  });

  if (!user) {
    return NextResponse.json({error: "User not found"}, {status: 404});
  }

  const existingShotSession = await prisma.shotSession.findUnique({
    where: {id: sessionId},
    include: {
      runner: true,
    },
  });

  if (!existingShotSession) {
    return NextResponse.json({error: "Session not found"}, {status: 404});
  }

  const membership = user.memberships.find(
    (m: { clubId: string; role: string }) =>
      m.clubId === existingShotSession.runner.clubId
  );

  if (!membership) {
    return NextResponse.json({error: "Forbidden"}, {status: 403});
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    return NextResponse.json({error: "Insufficient role"}, {status: 403});
  }

  await prisma.shotSession.delete({
    where: {id: sessionId},
  });

  return NextResponse.json({success: true});
}
