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
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">Ajouter un coureur</h1>

        <input
          type="text"
          placeholder="Nom du coureur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border px-3 py-2"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading || !clubId}
          label={loading ? "Ajout..." : "Ajouter"}
        />
      </form>
    </main>
  );
}