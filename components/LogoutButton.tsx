"use client";

import {signOut} from "next-auth/react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  callbackUrl?: string;
};

export default function LogoutButton({callbackUrl = "/"}: Props) {
  return (
    <BrutalButton
      label={"Déconnexion"}
      type="button"
      variant="accent"
      onClickFn={() => signOut({callbackUrl})}
    />
  );
}
