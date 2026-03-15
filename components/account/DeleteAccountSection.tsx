"use client";

import {signOut} from "next-auth/react";
import {useState} from "react";
import ConfirmModal from "@/components/ConfirmModal";
import BrutalButton from "@/components/BrutalButton";

export default function DeleteAccountSection() {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
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
    <section className="rounded-3xl border border-red-300 bg-white p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold text-red-600">Zone dangereuse</h2>

      <p className="mt-2 text-sm text-neutral-600">
        La suppression du compte est définitive. Vos rattachements seront retirés,
        mais les données sportives existantes du coureur resteront conservées.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez votre mot de passe"
          className="w-full rounded-2xl border px-3 py-2"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="button"
          onClickFn={() => setOpen(true)}
          label='Supprimer mon compte'
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