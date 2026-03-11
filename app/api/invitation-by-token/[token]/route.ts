import { NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/invitations/get-invitation-by-token";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return NextResponse.json(
      { message: "Invitation introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json(invitation);
}