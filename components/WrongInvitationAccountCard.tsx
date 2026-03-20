"use client";

import {signOut} from "next-auth/react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  token: string;
  sessionEmail: string;
  invitationEmail: string;
};

export default function WrongInvitationAccountCard({
                                                     token,
                                                     sessionEmail,
                                                     invitationEmail,
                                                   }: Props) {
  async function handleLogout() {
    await signOut({
      callbackUrl: `/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}`,
    });
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Invitation
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Mauvais compte connecté</h1>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
          Cette invitation a été envoyée à :
          <br/>
          <strong>{invitationEmail}</strong>
        </p>

        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
          Vous êtes actuellement connecté avec :
          <br/>
          <strong>{sessionEmail}</strong>
        </p>
      </div>

      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Pour accepter cette invitation, vous devez vous connecter avec l’adresse
        email invitée.
      </p>

      <div className="mt-6">
        <BrutalButton
          type="button"
          onClickFn={handleLogout}
          label="Se déconnecter et se reconnecter"
          variant="danger"
        />
      </div>
    </section>
  );
}
