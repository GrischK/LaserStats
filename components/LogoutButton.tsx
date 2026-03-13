"use client";

import {signOut} from "next-auth/react";

type Props = {
  callbackUrl?: string;
};

export default function LogoutButton({callbackUrl = "/login"}: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({callbackUrl})}
      className="rounded-lg border px-3 py-2 text-sm"
    >
      Se déconnecter
    </button>
  );
}