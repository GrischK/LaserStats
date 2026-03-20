import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvitationByToken } from "@/lib/invitations/get-invitation-by-token";
import AcceptInvitationCard from "@/components/AcceptInvitationCard";
import WrongInvitationAccountCard from "@/components/WrongInvitationAccountCard";

export default async function InvitePage({
                                           searchParams,
                                         }: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-8">
        <section className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          <h1 className="text-xl font-semibold">Invitation invalide</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Le lien d’invitation est manquant ou incorrect.
          </p>
        </section>
      </main>
    );
  }

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return (
      <main className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-8">
        <section className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          <h1 className="text-xl font-semibold">Invitation introuvable</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Cette invitation n’existe pas ou a déjà été traitée.
          </p>
        </section>
      </main>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}`);
  }

  const sessionEmail = session.user.email?.toLowerCase() ?? "";
  const invitationEmail = invitation.email.toLowerCase();

  if (sessionEmail !== invitationEmail) {
    return (
      <main className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-8">
        <WrongInvitationAccountCard
          token={token}
          sessionEmail={session.user.email ?? ""}
          invitationEmail={invitation.email}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-8">
      <AcceptInvitationCard token={token} invitation={invitation} />
    </main>
  );
}
