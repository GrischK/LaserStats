"use client";

import {useState} from "react";
import type {ClubInvitationItem, ClubRole} from "@/lib/types";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  clubId: string;
  availableRoles: ClubRole[];
  onCreated: (invitation: ClubInvitationItem) => void;
};

export default function InviteMemberForm({
                                           clubId,
                                           availableRoles,
                                           onCreated,
                                         }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ClubRole>(availableRoles[0] ?? "USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de l'envoi");
      }

      onCreated({
        id: data.id,
        email: data.email,
        role: data.role,
        status: data.status,
        token: data.token,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        invitedBy: data.invitedBy ?? null,
      });

      setEmail("");
      setRole(availableRoles[0] ?? "USER");
      setSuccess("Invitation envoyée");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
      <h2 className="text-2xl font-bold tracking-tight">Inviter un membre</h2>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Rôle</label>
          <select
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
            value={role}
            onChange={(e) => setRole(e.target.value as ClubRole)}
          >
            {availableRoles.map((value) => (
              <option key={value} value={value}>
                {value === "ADMIN"
                  ? "Admin"
                  : value === "COACH"
                    ? "Coach"
                    : "Utilisateur"}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}
        {success ? <p className="text-sm text-[var(--success)]">{success}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading}
          label={loading ? "Envoi..." : "Envoyer l'invite"}
          variant="primary"
          fullWidth
        />
      </form>
    </section>
  );
}
