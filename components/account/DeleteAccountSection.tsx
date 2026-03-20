"use client";

import {signOut} from "next-auth/react";
import {useState} from "react";
import ConfirmModal from "@/components/ConfirmModal";
import BrutalButton from "@/components/BrutalButton";
import {Eye, EyeOff} from "lucide-react";

export default function DeleteAccountSection() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const hasPasswordInput = password.trim().length > 0;

  async function handleOpenConfirm() {
    if (!hasPasswordInput) {
      setError("Mot de passe requis");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({password}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Mot de passe incorrect");
      }

      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDelete() {
    if (!hasPasswordInput) {
      setError("Mot de passe requis");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({password}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de supprimer le compte");
      }

      await signOut({callbackUrl: "/login"});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-red-300 bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold text-red-600">Zone dangereuse</h2>

      <p className="mt-2 text-sm text-neutral-600">
        La suppression du compte est définitive. Vos rattachements seront retirés,
        mais les données sportives existantes du coureur resteront conservées.
      </p>

      <div className="mt-4 space-y-3">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            className="w-full rounded-2xl border px-3 py-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
            aria-label={
              showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
          >
            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="button"
          onClickFn={() => void handleOpenConfirm()}
          disabled={!hasPasswordInput || verifying || loading}
          label={verifying ? "Vérification..." : "Supprimer mon compte"}
          variant="danger"
        />
      </div>

      <ConfirmModal
        open={open}
        title="Supprimer votre compte ?"
        description="Cette action est définitive. Votre compte sera supprimé et vous serez déconnecté."
        confirmLabel="Oui, supprimer mon compte"
        cancelLabel="Annuler"
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
