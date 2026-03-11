import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getStartOfDay} from "@/lib/utils";
import {createSessionSchema} from "@/lib/validators";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const dayParam = searchParams.get("day");
  const day = dayParam ? new Date(dayParam) : getStartOfDay();
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);

  const sessions = await prisma.shotSession.findMany({
    where: {
      sessionDay: {
        gte: start,
        lt: end,
      },
    },
    include: {
      runner: true,
    },
    orderBy: [{runner: {name: "asc"}}, {createdAt: "desc"}],
  });

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
  }

  const session = await prisma.shotSession.create({
    data: {
      runnerId: parsed.data.runnerId,
      distance: parsed.data.distance,
      targetsHit: parsed.data.targetsHit,
      sessionDay: getStartOfDay(),
    },
    include: {
      runner: true,
    },
  });

  return NextResponse.json(session, {status: 201});
}