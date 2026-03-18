"use client";

import {signIn} from "next-auth/react";
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import BrutalButton from "@/components/BrutalButton";
import RegisterForm from "@/components/RegisterForm";
import {Eye, EyeOff} from "lucide-react";

type Props = {
  callbackUrl?: string;
};

export default function LoginPageContent({callbackUrl: callbackUrlProp}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl =
    callbackUrlProp ||
    searchParams.get("callbackUrl") ||
    "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      router.replace(result?.url || callbackUrl);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md items-center p-6">
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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

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
    </div>
  );
}