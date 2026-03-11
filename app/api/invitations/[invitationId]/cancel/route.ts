import {NextResponse} from "next/server";
import {getAuthSession} from "@/lib/session";
import {cancelInvitation} from "@/lib/invitations/cancel-invitation";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ invitationId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({message: "Non autorisé"}, {status: 401});
    }

    const {invitationId} = await context.params;

    const result = await cancelInvitation({
      invitationId,
      currentUserId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 400});
  }
}