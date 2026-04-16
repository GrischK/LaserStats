"use client";

import {useState} from "react";
import BrutalButton from "@/components/BrutalButton";
import {Eye, EyeOff} from "lucide-react";

type Props = {
  hasPassword: boolean;
};

export default function PasswordForm({hasPassword}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold">Mot de passe</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {hasPassword ? (
          <div className="space-y-1">
            <label className="text-sm font-medium">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
                aria-label={
                  showCurrentPassword
                    ? "Masquer le mot de passe actuel"
                    : "Afficher le mot de passe actuel"
                }
              >
                {showCurrentPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-sm font-medium">Nouveau mot de passe</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
              aria-label={
                showNewPassword
                  ? "Masquer le nouveau mot de passe"
                  : "Afficher le nouveau mot de passe"
              }
            >
              {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Confirmer le mot de passe</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
              aria-label={
                showConfirmPassword
                  ? "Masquer la confirmation du mot de passe"
                  : "Afficher la confirmation du mot de passe"
              }
            >
              {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        {success ? <p className="text-sm text-green-600">{success}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading}
          label={loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          variant="accent"
        />
      </form>
    </section>
  );
}
