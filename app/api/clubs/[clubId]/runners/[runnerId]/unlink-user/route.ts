import {NextResponse} from "next/server";
import {getAuthSession} from "@/lib/session";
import {unlinkRunnerFromUser} from "@/lib/runners/unlink-runner-from-user";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ clubId: string; runnerId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({message: "Non autorisé"}, {status: 401});
    }

    const {clubId, runnerId} = await context.params;

    const result = await unlinkRunnerFromUser({
      currentUserId: session.user.id,
      clubId,
      runnerId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 400});
  }
}