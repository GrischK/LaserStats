"use client";

import {useState} from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  initialName: string;
  initialEmail: string;
  initialImage: string;
};

export default function ProfileForm({
                                      initialName,
                                      initialEmail,
                                      initialImage,
                                    }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          image,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de mettre à jour le profil");
      }

      setSuccess("Profil mis à jour");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold">Profil</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Photo de profil (URL)</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        {success ? <p className="text-sm text-green-600">{success}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <BrutalButton
          type="submit"
          disabled={loading}
          label={loading ? "Enregistrement..." : "Enregistrer"}
        />
      </form>
    </section>
  );
}