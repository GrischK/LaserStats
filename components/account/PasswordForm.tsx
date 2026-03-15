"use client";

import {useState} from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  hasPassword: boolean;
};

export default function PasswordForm({hasPassword}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de modifier le mot de passe");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Mot de passe mis à jour");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold">Mot de passe</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {hasPassword ? (
          <div className="space-y-1">
            <label className="text-sm font-medium">Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2"
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-sm font-medium">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        {success ? <p className="text-sm text-green-600">{success}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading}
          label={loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        />
      </form>
    </section>
  );
}