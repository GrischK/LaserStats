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
  const [nameFilter, setNameFilter] = useState("");

  const pendingDeleteRunner = useMemo(
    () => runners.find((runner) => runner.id === pendingDeleteRunnerId) ?? null,
    [pendingDeleteRunnerId, runners]
  );

  const filteredRunners = useMemo(() => {
    const query = nameFilter.trim().toLocaleLowerCase("fr-FR");

    if (!query) {
      return runners;
    }

    return runners.filter((runner) =>
      runner.name.toLocaleLowerCase("fr-FR").includes(query)
    );
  }, [nameFilter, runners]);

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
    <section className="-mx-4 md:border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
      <h2 className="text-2xl font-bold tracking-tight">Liste des coureurs</h2>

      <div className="mt-4 space-y-2">
        <label htmlFor="runner-name-filter" className="block text-sm font-semibold">
          Filtrer par nom
        </label>
        <input
          id="runner-name-filter"
          type="search"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Rechercher un coureur"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
        />
        <p className="text-sm text-[var(--muted-foreground)]">
          {filteredRunners.length} coureur{filteredRunners.length > 1 ? "s" : ""} affiché{filteredRunners.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-4 sm:space-y-3">
        {runners.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Aucun coureur actif.</p>
        ) : filteredRunners.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Aucun coureur ne correspond à cette recherche.
          </p>
        ) : (
          filteredRunners.map((runner) => {
            const isEditing = editingRunnerId === runner.id;
            const isLoading = loadingRunnerId === runner.id;

            return (
              <div
                key={runner.id}
                className="runner-link-row relative py-4 sm:rounded-xl sm:border sm:border-[var(--border)] sm:p-4"
              >
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="font-semibold">{runner.name}</p>
                    )}

                    <p className="text-sm text-[var(--muted-foreground)]">
                      {runner._count.sessions} session
                      {runner._count.sessions > 1 ? "s" : ""}
                    </p>

                    {runner.user ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        {runner.user.image ? (
                          <img
                            src={runner.user.image}
                            alt={`Avatar de ${runner.user.name ?? runner.user.email}`}
                            className="h-8 w-8 rounded-full border border-[var(--border)] object-cover"
                          />
                        ) : null}
                        <span className="min-w-0 break-words">
                          Compte lié: {runner.user.name ?? runner.user.email}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Aucun compte lié</p>
                    )}
                  </div>

                  <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
                    {isEditing ? (
                      <>
                        <BrutalButton
                          type="button"
                          onClickFn={() => saveName(runner.id)}
                          disabled={isLoading}
                          label={isLoading ? "Enregistrement..." : "Enregistrer"}
                          variant="primary"
                          fullWidth
                        />
                        <BrutalButton
                          type="button"
                          onClickFn={cancelEdit}
                          disabled={isLoading}
                          label="Annuler"
                          variant="soft"
                          fullWidth
                        />
                      </>
                    ) : (
                      <>
                        <BrutalButton
                          type="button"
                          onClickFn={() => startEdit(runner)}
                          disabled={Boolean(loadingRunnerId)}
                          label="Modifier le nom"
                          variant="soft"
                          fullWidth
                        />
                        <BrutalButton
                          type="button"
                          onClickFn={() => openDeleteConfirm(runner.id)}
                          disabled={Boolean(loadingRunnerId)}
                          label="Supprimer"
                          variant="danger"
                          fullWidth
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

      {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-[var(--success)]">{success}</p> : null}

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
