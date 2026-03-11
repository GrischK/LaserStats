import {NextResponse} from "next/server";
import {authOptions} from "@/lib/auth";
import {acceptInvitation} from "@/lib/invitations/accept-invitation";
import {getServerSession} from "next-auth";

export async function POST(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({message: "Non autorisé"}, {status: 401});
    }

    const {token} = await context.params;

    const result = await acceptInvitation({
      token,
      currentUserId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({message}, {status: 400});
  }
}