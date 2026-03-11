"use client";

import {useState} from "react";

export default function CreateClubPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({name}),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du club");
      }

      const club = await response.json();
      window.location.href = `/clubs/${club.id}`;
    } catch (err) {
      console.error(err);
      setError("Impossible de créer le club");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">Créer un club</h1>

        <input
          type="text"
          placeholder="Nom du club"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border px-3 py-2"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border px-4 py-2 font-medium"
        >
          {loading ? "Création..." : "Créer le club"}
        </button>
      </form>
    </main>
  );
}