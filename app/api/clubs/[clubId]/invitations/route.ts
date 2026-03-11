import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createInvitation } from "@/lib/invitations/create-invitation";
import { listClubInvitations } from "@/lib/invitations/list-club-invitations";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { clubId } = await context.params;

    const invitations = await listClubInvitations({
      clubId,
      currentUserId: session.user.id,
    });

    return NextResponse.json(invitations);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { clubId } = await context.params;
    const body = await req.json();

    const invitation = await createInvitation({
      currentUserId: session.user.id,
      clubId,
      email: body.email,
      role: body.role,
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur";

    return NextResponse.json({ message }, { status: 400 });
  }
}