"use client";

import {useState} from "react";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border p-5">
      <div>
        <h2 className="text-xl font-semibold">Nouvelle session</h2>
        <p className="text-sm text-gray-600">
          Distance optionnelle, date du jour automatique
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Distance</label>

        <input
          type="number"
          step="0.1"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="Ex. 10"
          className="rounded-xl border px-3 py-2"
        />

        <div className="flex flex-wrap gap-2">
          {distanceOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDistance(String(value))}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              {value} m
            </button>
          ))}

          <button
            type="button"
            onClick={() => setDistance("")}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Effacer
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Cibles touchées</label>

        <div className="flex flex-wrap gap-2">
          {hitOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTargetsHit(value)}
              className={`rounded-xl border px-4 py-2 ${
                targetsHit === value ? "font-bold" : ""
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl border px-4 py-3 font-medium"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}