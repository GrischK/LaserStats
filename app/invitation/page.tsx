import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";
import {getInvitationByToken} from "@/lib/invitations/get-invitation-by-token";
import AcceptInvitationCard from "@/components/AcceptInvitationCard";

export default async function InvitePage({searchParams,}: { searchParams: Promise<{ token?: string }>; }) {
  const {token} = await searchParams;

  if (!token) {
    return <div>Invitation invalide</div>;
  }

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return <div>Invitation introuvable</div>;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}`);
  }

  return <AcceptInvitationCard token={token} invitation={invitation}/>;
}