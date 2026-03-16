"use client";

import {signIn} from "next-auth/react";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import BrutalButton from "@/components/BrutalButton";
import RegisterForm from "@/components/RegisterForm";

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
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
    <main className="mx-auto flex w-full max-w-md items-center p-6">
      {mode === "login" ? (
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4 rounded-2xl p-6"
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

          <BrutalButton
            label={loading ? "Connexion..." : "Se connecter"}
            type="submit"
            disabled={loading}
          />

          <p className="mt-10 text-sm text-gray-600">
            Pas encore de compte ?
          </p>

          <button
            type="button"
            onClick={() => setMode("register")}
            className="w-fit"
          >
            <BrutalButton label="Créer un compte"/>
          </button>
        </form>
      ) : (
        <div className="w-full">
          <RegisterForm callbackUrl={callbackUrl}/>

          <button
            type="button"
            onClick={() => setMode("login")}
            className="mt-6 text-sm font-medium underline"
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      )}
    </main>
  );
}