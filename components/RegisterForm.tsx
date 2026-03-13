"use client";

import {useState} from "react";
import {signIn} from "next-auth/react";

type Props = {
  callbackUrl: string;
};

export default function RegisterForm({callbackUrl}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData?.message || "Erreur lors de l'inscription");
      }

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl,
      });

      if (loginRes?.error) {
        throw new Error("Compte créé, mais connexion impossible");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Créer un compte</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            className="w-full rounded-xl border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
          />
        </div>

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
          <label className="text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            className="w-full rounded-xl border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}