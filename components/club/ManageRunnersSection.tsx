"use client";

import { useMemo, useState } from "react";
import BrutalButton from "@/components/BrutalButton";
import ConfirmModal from "@/components/ConfirmModal";

type RunnerItem = {
  id: string;
  name: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  _count: {
    sessions: number;
  };
};

type Props = {
  clubId: string;
  initialRunners: RunnerItem[];
};

export default function ManageRunnersSection({ clubId, initialRunners }: Props) {
  const [runners, setRunners] = useState<RunnerItem[]>(initialRunners);
  const [editingRunnerId, setEditingRunnerId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [pendingDeleteRunnerId, setPendingDeleteRunnerId] = useState<string | null>(null);
  const [loadingRunnerId, setLoadingRunnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pendingDeleteRunner = useMemo(
    () => runners.find((runner) => runner.id === pendingDeleteRunnerId) ?? null,
    [pendingDeleteRunnerId, runners]
  );

  function startEdit(runner: RunnerItem) {
    setEditingRunnerId(runner.id);
    setNameDraft(runner.name);
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    if (loadingRunnerId) return;
    setEditingRunnerId(null);
    setNameDraft("");
  }

  async function saveName(runnerId: string) {
    const nextName = nameDraft.trim();
    if (!nextName) {
      setError("Le nom est requis");
      return;
    }

    setLoadingRunnerId(runnerId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/runners/${runnerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nextName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de renommer le coureur");
      }

      setRunners((prev) =>
        prev.map((runner) =>
          runner.id === runnerId ? { ...runner, name: data.name ?? nextName } : runner
        )
      );
      setEditingRunnerId(null);
      setNameDraft("");
      setSuccess("Nom du coureur mis à jour");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingRunnerId(null);
    }
  }

  function openDeleteConfirm(runnerId: string) {
    setPendingDeleteRunnerId(runnerId);
    setError(null);
    setSuccess(null);
  }

  function closeDeleteConfirm() {
    if (loadingRunnerId) return;
    setPendingDeleteRunnerId(null);
  }

  async function confirmDelete() {
    if (!pendingDeleteRunnerId) return;

    setLoadingRunnerId(pendingDeleteRunnerId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/runners/${pendingDeleteRunnerId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de supprimer ce coureur");
      }

      setRunners((prev) => prev.filter((runner) => runner.id !== pendingDeleteRunnerId));
      setPendingDeleteRunnerId(null);
      setEditingRunnerId((current) =>
        current === pendingDeleteRunnerId ? null : current
      );
      setSuccess("Coureur supprimé");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingRunnerId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <div className="mt-4 space-y-3">
        {runners.length === 0 ? (
          <p className="text-sm text-neutral-600">Aucun coureur actif.</p>
        ) : (
          runners.map((runner) => {
            const isEditing = editingRunnerId === runner.id;
            const isLoading = loadingRunnerId === runner.id;

            return (
              <div key={runner.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full rounded-xl border px-3 py-2"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="font-medium">{runner.name}</p>
                    )}

                    <p className="text-sm text-neutral-600">
                      {runner._count.sessions} session
                      {runner._count.sessions > 1 ? "s" : ""}
                    </p>

                    {runner.user ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                        {runner.user.image ? (
                          <img
                            src={runner.user.image}
                            alt={`Avatar de ${runner.user.name ?? runner.user.email}`}
                            className="h-6 w-6 rounded-full border object-cover"
                          />
                        ) : null}
                        <span>
                          Compte lié: {runner.user.name ?? runner.user.email}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-neutral-500">Aucun compte lié</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <BrutalButton
                          type="button"
                          onClickFn={() => saveName(runner.id)}
                          disabled={isLoading}
                          label={isLoading ? "Enregistrement..." : "Enregistrer"}
                        />
                        <BrutalButton
                          type="button"
                          onClickFn={cancelEdit}
                          disabled={isLoading}
                          label="Annuler"
                        />
                      </>
                    ) : (
                      <>
                        <BrutalButton
                          type="button"
                          onClickFn={() => startEdit(runner)}
                          disabled={Boolean(loadingRunnerId)}
                          label="Modifier le nom"
                        />
                        <BrutalButton
                          type="button"
                          onClickFn={() => openDeleteConfirm(runner.id)}
                          disabled={Boolean(loadingRunnerId)}
                          label="Supprimer"
                          variant="danger"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-green-600">{success}</p> : null}

      <ConfirmModal
        open={Boolean(pendingDeleteRunner)}
        title="Supprimer ce coureur ?"
        description={
          pendingDeleteRunner
            ? `Le coureur "${pendingDeleteRunner.name}" sera retiré des listes actives du club. Les sessions restent conservées.`
            : undefined
        }
        confirmLabel="Supprimer"
        label="Suppression..."
        loading={Boolean(loadingRunnerId)}
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
