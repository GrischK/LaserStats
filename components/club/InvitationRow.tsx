"use client";

import {useState} from "react";
import type {ClubInvitationItem} from "./InvitationList";

type Props = {
  invitation: ClubInvitationItem;
  onCancelled: (invitationId: string) => void;
};

export default function InvitationRow({invitation, onCancelled}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel =
    invitation.role === "ADMIN"
      ? "Admin"
      : invitation.role === "COACH"
        ? "Coach"
        : "Utilisateur";

  async function handleCancel() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invitations/${invitation.id}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible d'annuler l'invitation");
      }

      onCancelled(invitation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{invitation.email}</p>
          <p className="text-sm text-neutral-600">
            Rôle : {roleLabel}
          </p>
          <p className="text-sm text-neutral-500">
            Expire le{" "}
            {new Date(invitation.expiresAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          {loading ? "Suppression..." : "Supprimer"}
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}