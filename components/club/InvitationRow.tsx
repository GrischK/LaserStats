"use client";

import {useState} from "react";
import type {ClubInvitationItem} from "@/lib/invitations/types";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  invitation: ClubInvitationItem;
  onCancelled: (invitationId: string) => void;
};

export default function InvitationRow({invitation, onCancelled}: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel =
    invitation.role === "ADMIN"
      ? "Admin"
      : invitation.role === "COACH"
        ? "Coach"
        : "Utilisateur";

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invitation.token}`;

  async function handleCancel() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invitations/${invitation.id}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible d'annuler l'invite");
      }

      onCancelled(invitation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{invitation.email}</p>
          <p className="text-sm text-neutral-600">Rôle : {roleLabel}</p>
          <p className="text-sm text-neutral-500">
            Expire le {new Date(invitation.expiresAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <BrutalButton
          type="button"
          onClickFn={handleCancel}
          disabled={loading}
          label={loading ? "Suppression..." : "Supprimer"}
          variant="danger"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <BrutalButton
          type="button"
          onClickFn={() => setShowLink((prev) => !prev)}
          label={showLink ? "Masquer le lien" : "Afficher le lien"}
        />
        <BrutalButton
          type="button"
          onClickFn={handleCopy}
          label={copied ? "Copié" : "Copier le lien"}
        />
      </div>

      {showLink ? (
        <div className="mt-3 rounded-lg bg-[var(--card)] p-2">
          <p className="break-all text-xs text-neutral-200">{inviteUrl}</p>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}