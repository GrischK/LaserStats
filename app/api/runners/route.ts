import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {createRunnerSchema} from "@/lib/validators";

export async function GET() {
  const runners = await prisma.runner.findMany({
    where: {active: true},
    orderBy: {name: "asc"},
  });

  return NextResponse.json(runners);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createRunnerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
  }

  const runner = await prisma.runner.create({
    data: {name: parsed.data.name},
  });

  return NextResponse.json(runner, {status: 201});
}