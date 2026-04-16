"use client";

import {useState} from "react";
import type {ClubInvitationItem} from "@/lib/types";
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
    <div className="border-b border-[var(--border)] py-4 last:border-b-0 sm:rounded-xl sm:border sm:p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{invitation.email}</p>
          <p className="text-sm text-[var(--muted-foreground)]">Rôle : {roleLabel}</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Expire le {new Date(invitation.expiresAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <BrutalButton
          type="button"
          onClickFn={handleCancel}
          disabled={loading}
          label={loading ? "Suppression..." : "Supprimer"}
          variant="danger"
          className="w-full sm:w-auto"
        />
      </div>

      <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
        <BrutalButton
          type="button"
          onClickFn={() => setShowLink((prev) => !prev)}
          label={showLink ? "Masquer le lien" : "Afficher le lien"}
          variant="soft"
        />
        <BrutalButton
          type="button"
          onClickFn={handleCopy}
          label={copied ? "Copié" : "Copier le lien"}
          variant="soft"
        />
      </div>

      {showLink ? (
        <div className="mt-3 rounded-lg bg-[var(--muted)] px-3 py-2">
          <p className="break-all text-xs text-[var(--muted-foreground)]">{inviteUrl}</p>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
