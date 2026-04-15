"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Square } from "lucide-react";
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

export default function SessionForm({ runnerId, onCreated }: Props) {
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
      className="-mx-4 border-y border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:py-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-6 sm:shadow-[var(--shadow)]"
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
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
          />

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {distanceOptions.map((value) => {
              const active = distance === String(value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDistance(String(value))}
                  className={`min-h-12 rounded-lg px-4 py-3 text-sm font-semibold transition active:translate-y-px ${
                    active
                      ? "bg-[image:var(--selected-bg)] text-[var(--selected-foreground)]"
                      : "bg-[var(--surface-strong)] text-[var(--fg)] hover:brightness-95"
                  }`}
                >
                  {value} m
                </button>
              );
            })}

            <BrutalButton
              type="button"
              onClickFn={() => setDistance("")}
              label="Effacer"
              variant="soft"
              className="sm:col-span-1"
              fullWidth
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Cibles touchées
          </label>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {hitOptions.map((value) => {
              const active = targetsHit === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTargetsHit(value)}
                  className={`h-14 rounded-lg px-4 text-lg font-bold transition active:translate-y-px ${
                    active
                      ? "bg-[image:var(--selected-bg)] text-[var(--selected-foreground)]"
                      : "bg-[var(--surface-strong)] text-[var(--fg)] hover:brightness-95"
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
            <p className="mt-1 text-4xl font-black tabular-nums tracking-tight">
              {formatChrono(timerElapsedSeconds)}
            </p>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                aria-label={
                  timerRunning
                    ? "Arrêter le chrono et remplir le temps"
                    : "Démarrer le chrono"
                }
                title={timerRunning ? "Arrêter et remplir" : "Démarrer"}
                disabled={loading}
                onClick={timerRunning ? handleStopTimer : handleStartTimer}
                className={`flex min-h-14 w-full items-center justify-center rounded-lg px-3 py-3 transition hover:brightness-95 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${
                  timerRunning
                    ? "bg-[image:var(--accent-gradient)] text-[var(--accent-sport-foreground)]"
                    : "bg-[image:var(--primary-gradient)] text-[var(--primary-foreground)]"
                }`}
              >
                {timerRunning ? (
                  <Square size={22} fill="currentColor" aria-hidden="true" />
                ) : (
                  <Play size={23} fill="currentColor" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                aria-label="Réinitialiser le chrono"
                title="Reset"
                disabled={loading}
                onClick={handleResetTimer}
                className="flex min-h-14 w-14 items-center justify-center rounded-lg bg-[var(--card)] text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border)] transition hover:bg-[var(--muted)] hover:text-[var(--fg)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={21} aria-hidden="true" />
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
            className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
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
            variant="primary"
            fullWidth
            label={loading ? "Enregistrement..." : "Enregistrer"}
          />
        </div>
      </div>
    </form>
  );
}
