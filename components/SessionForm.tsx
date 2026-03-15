"use client";

import {useState} from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  clubId: string;
  runnerId: string;
};

const hitOptions = [0, 1, 2, 3, 4, 5];
const distanceOptions = [200, 400, 600, 800];

export default function SessionForm({clubId, runnerId}: Props) {
  const [distance, setDistance] = useState("");
  const [targetsHit, setTargetsHit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runnerId,
          distance: distance === "" ? null : Number(distance),
          targetsHit,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l’enregistrement");
      }

      window.location.href = `/clubs/${clubId}/runners/${runnerId}`;
    } catch (err) {
      console.error(err);
      setError("Impossible d’enregistrer la session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Nouvelle session</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Distance optionnelle, date du jour automatique
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">Distance</label>

          <input
            type="number"
            min="1"
            step="1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Ex: 200 m"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {distanceOptions.map((value) => {
              const active = distance === String(value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDistance(String(value))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--muted)] text-[var(--fg)] hover:bg-[var(--card)]"
                  }`}
                >
                  {value} m
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setDistance("")}
              className="rounded-full border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)]"
            >
              Effacer
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Cibles touchées
          </label>

          <div className="flex flex-wrap gap-2">
            {hitOptions.map((value) => {
              const active = targetsHit === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTargetsHit(value)}
                  className={`h-12 min-w-12 rounded-2xl px-4 text-base font-semibold transition ${
                    active
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--muted)] text-[var(--fg)] hover:bg-[var(--card)]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-center">
          <BrutalButton
            type="submit"
            disabled={loading}
            label={loading ? "Enregistrement..." : "Enregistrer"}
          />
        </div>

      </div>
    </form>
  );
}