"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InvitationDetails } from "@/lib/types";
import BrutalButton from "@/components/BrutalButton";

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
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Invitation
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Rejoindre un club</h1>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
          <span className="font-medium">Club :</span> {invitation.club.name}
        </p>
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
          <span className="font-medium">Rôle :</span> {roleLabel}
        </p>
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
          <span className="font-medium">Pour :</span> {invitation.email}
        </p>
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
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
        <BrutalButton
          type="button"
          onClickFn={handleAccept}
          disabled={loading || invitation.status !== "PENDING"}
          label={loading ? "Acceptation..." : "Accepter l'invitation"}
        />
      </div>
    </section>
  );
}
