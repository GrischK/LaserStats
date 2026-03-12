"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InvitationDetails } from "@/lib/invitations/types";

type Props = {
  token: string;
  invitation: InvitationDetails;
};

export default function AcceptInvitationCard({ token, invitation }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel =
    invitation.role === "ADMIN"
      ? "Admin"
      : invitation.role === "COACH"
        ? "Coach"
        : "Utilisateur";

  async function handleAccept() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invitation-by-token/${token}/accept`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible d'accepter l'invite");
      }

      router.push(`/clubs/${data.clubId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Invitation à rejoindre un club</h1>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="font-medium">Club :</span> {invitation.club.name}
        </p>
        <p>
          <span className="font-medium">Rôle :</span> {roleLabel}
        </p>
        <p>
          <span className="font-medium">Pour :</span> {invitation.email}
        </p>
        <p>
          <span className="font-medium">Invité par :</span>{" "}
          {invitation.invitedBy.name || invitation.invitedBy.email}
        </p>
      </div>

      {invitation.status !== "PENDING" ? (
        <p className="mt-4 text-sm text-red-600">
          Cette invitation n'est plus disponible.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6">
        <button
          onClick={handleAccept}
          disabled={loading || invitation.status !== "PENDING"}
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Acceptation..." : "Accepter l'invite"}
        </button>
      </div>
    </div>
  );
}