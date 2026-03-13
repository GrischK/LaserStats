"use client";

import {signOut} from "next-auth/react";

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
    <div className="mx-auto max-w-lg rounded-2xl border p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Mauvais compte connecté</h1>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          Cette invitation a été envoyée à :
          <br/>
          <strong>{invitationEmail}</strong>
        </p>

        <p>
          Vous êtes actuellement connecté avec :
          <br/>
          <strong>{sessionEmail}</strong>
        </p>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        Pour accepter cette invitation, vous devez vous connecter avec l’adresse
        email invitée.
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          Se déconnecter et se reconnecter
        </button>
      </div>
    </div>
  );
}