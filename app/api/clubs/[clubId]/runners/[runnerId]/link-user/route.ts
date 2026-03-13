import {NextRequest, NextResponse} from "next/server";
import {getAuthSession} from "@/lib/session";
import {linkRunnerToUser} from "@/lib/runners/link-runner-to-user";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ clubId: string; runnerId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({message: "Non autorisé"}, {status: 401});
    }

    const {clubId, runnerId} = await context.params;
    const body = await req.json();

    const userId = body?.userId;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        {message: "userId requis"},
        {status: 400}
      );
    }

    const result = await linkRunnerToUser({
      currentUserId: session.user.id,
      clubId,
      runnerId,
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 400});
  }
}