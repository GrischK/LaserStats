"use client";

import {signIn} from "next-auth/react";
import {useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      window.location.href = result?.url || callbackUrl;
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 rounded-2xl border p-6"
      >
        <h1 className="text-2xl font-bold">Connexion</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border px-3 py-2"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border px-3 py-2"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border px-4 py-2 font-medium"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-sm text-gray-600">
          Pas encore de compte ?
        </p>

        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-sm font-medium underline"
        >
          Créer un compte
        </Link>
      </form>
    </main>
  );
}