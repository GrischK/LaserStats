"use client";

import { useEffect, useRef, useState } from "react";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  clubId: string;
  runnerId: string;
  onCreated: (session: {
    id: string;
    createdAt: string | Date;
    distance: number | null;
    targetsHit: number;
    durationSeconds: number | null;
  }) => void;
};

const hitOptions = [0, 1, 2, 3, 4, 5];
const distanceOptions = [200, 400, 600, 800];

function formatChrono(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function SessionForm({ clubId, runnerId, onCreated }: Props) {
  const [distance, setDistance] = useState("");
  const [targetsHit, setTargetsHit] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsedSeconds, setTimerElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerRunning) return;

    const intervalId = window.setInterval(() => {
      if (!timerStartedAtRef.current) return;

      const elapsed = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
      setTimerElapsedSeconds(elapsed);
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [timerRunning]);

  function handleStartTimer() {
    setError("");
    timerStartedAtRef.current = Date.now();
    setTimerElapsedSeconds(0);
    setTimerRunning(true);
  }

  function handleStopTimer() {
    if (!timerStartedAtRef.current) return;

    const elapsed = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
    setTimerElapsedSeconds(elapsed);
    setDurationSeconds(String(elapsed));
    setTimerRunning(false);
    timerStartedAtRef.current = null;
  }

  function handleResetTimer() {
    setTimerRunning(false);
    setTimerElapsedSeconds(0);
    timerStartedAtRef.current = null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const duration =
      durationSeconds === "" ? null : Number(durationSeconds);

    if (
      duration !== null &&
      (!Number.isInteger(duration) || duration < 0 || duration > 50)
    ) {
      setError("Le temps doit être un entier entre 0 et 50 secondes");
      return;
    }

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
          durationSeconds: duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l’enregistrement");
      }

      const createdSession = await response.json();

      onCreated({
        id: createdSession.id,
        createdAt: createdSession.createdAt,
        distance: createdSession.distance,
        targetsHit: createdSession.targetsHit,
        durationSeconds: createdSession.durationSeconds,
      });

      setDistance("");
      setTargetsHit(0);
      setDurationSeconds("");
      handleResetTimer();
      setError("");
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
          <label className="block text-sm font-semibold">Distance</label>
          <p className="mb-2 text-sm text-[var(--muted-foreground)]">
            Optionnel
          </p>
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

        <div>
          <label className="block text-sm font-semibold">
            Temps de la session
          </label>
          <p className="mb-2 text-sm text-[var(--muted-foreground)]">
            Optionnel
          </p>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Chrono
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {formatChrono(timerElapsedSeconds)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={timerRunning || loading}
                onClick={handleStartTimer}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Démarrer
              </button>
              <button
                type="button"
                disabled={!timerRunning || loading}
                onClick={handleStopTimer}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Arrêter et remplir
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleResetTimer}
                className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          <input
            type="number"
            min="0"
            max="50"
            step="1"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(e.target.value)}
            placeholder="Ex: 35 secondes"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] mt-4 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
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
