"use client";

import {useState} from "react";
import type {ClubInvitationItem, ClubRole} from "@/lib/invitations/types";
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
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">Inviter un membre</h2>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Rôle</label>
          <select
            className="w-full rounded-xl border px-3 py-2"
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

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading}
          label={loading ? "Envoi..." : "Envoyer l'invite"}
        />
      </form>
    </div>
  );
}