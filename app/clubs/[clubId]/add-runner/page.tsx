"use client";

import { useEffect, useState } from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default function AddRunnerPage({ params }: Props) {
  const [clubId, setClubId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadParams() {
      const { clubId } = await params;
      setClubId(clubId);
    }

    loadParams();
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/runners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          clubId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l’ajout du coureur");
      }

      window.location.href = `/clubs/${clubId}`;
    } catch (err) {
      console.error(err);
      setError("Impossible d’ajouter le coureur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col sm:justify-center sm:px-6 sm:py-6">
      <h1>Ajouter un coureur</h1>
      <form
        onSubmit={handleSubmit}
        className="px-0 py-0 sm:rounded-2xl sm:border sm:border-[var(--border)] sm:bg-[var(--card)] sm:p-6 sm:shadow-[var(--shadow)]"
      >
        <div className="mb-6">
          <p className="mt-10 text-sm text-[var(--muted-foreground)]">
            Créez un profil coureur pour enregistrer ses sessions.
          </p>
        </div>

        <div className="space-y-6">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Nom du coureur</span>
            <input
              type="text"
              placeholder="Ex: Léa Martin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <BrutalButton
              href={clubId ? `/clubs/${clubId}` : "#"}
              label="Retour"
              variant="soft"
              fullWidth
            />
            <BrutalButton
              type="submit"
              disabled={loading || !clubId || !name.trim()}
              label={loading ? "Ajout..." : "Ajouter"}
              variant="primary"
              fullWidth
            />
          </div>
        </div>
      </form>
    </main>
  );
}
