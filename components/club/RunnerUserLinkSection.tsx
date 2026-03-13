"use client";

import {useMemo, useState} from "react";
import ConfirmModal from "@/components/ConfirmModal";

type RunnerItem = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string | Date;
  sessionsCount: number;
};

type MemberItem = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "COACH" | "USER";
};

type Props = {
  clubId: string;
  runners: RunnerItem[];
  members: MemberItem[];
};

export default function RunnerUserLinkSection({
                                                clubId,
                                                runners,
                                                members,
                                              }: Props) {
  const [runnerList, setRunnerList] = useState<RunnerItem[]>(runners);
  const [memberList, setMemberList] = useState<MemberItem[]>(members);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});
  const [loadingRunnerId, setLoadingRunnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRunnerId, setPendingRunnerId] = useState<string | null>(null);

  const pendingRunner = useMemo(() => {
    if (!pendingRunnerId) return null;
    return runnerList.find((runner) => runner.id === pendingRunnerId) ?? null;
  }, [pendingRunnerId, runnerList]);

  const pendingUser = useMemo(() => {
    if (!pendingRunnerId) return null;
    const userId = selectedUsers[pendingRunnerId];
    if (!userId) return null;
    return memberList.find((member) => member.id === userId) ?? null;
  }, [pendingRunnerId, selectedUsers, memberList]);

  function openConfirm(runnerId: string) {
    const userId = selectedUsers[runnerId];

    if (!userId) {
      setError("Sélectionnez un membre à associer.");
      return;
    }

    setError(null);
    setPendingRunnerId(runnerId);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (loadingRunnerId) return;
    setConfirmOpen(false);
    setPendingRunnerId(null);
  }

  async function confirmLink() {
    if (!pendingRunnerId) return;

    const userId = selectedUsers[pendingRunnerId];

    if (!userId) {
      setError("Sélectionnez un membre à associer.");
      setConfirmOpen(false);
      setPendingRunnerId(null);
      return;
    }

    setLoadingRunnerId(pendingRunnerId);
    setError(null);

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/runners/${pendingRunnerId}/link-user`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId}),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de faire l'association");
      }

      setRunnerList((prev) => prev.filter((runner) => runner.id !== pendingRunnerId));
      setMemberList((prev) => prev.filter((member) => member.id !== userId));
      setSelectedUsers((prev) => {
        const next = {...prev};
        delete next[pendingRunnerId];
        return next;
      });

      setConfirmOpen(false);
      setPendingRunnerId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingRunnerId(null);
    }
  }

  return (
    <>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Runners non liés</h2>

        <div className="mt-4 space-y-4">
          {runnerList.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Tous les runners sont déjà associés.
            </p>
          ) : (
            runnerList.map((runner) => (
              <div
                key={runner.id}
                className="rounded-xl border p-4"
              >
                <div className="mb-3">
                  <p className="font-medium">{runner.name}</p>
                  <p className="text-sm text-neutral-600">
                    {runner.sessionsCount} session{runner.sessionsCount > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={selectedUsers[runner.id] ?? ""}
                    onChange={(e) =>
                      setSelectedUsers((prev) => ({
                        ...prev,
                        [runner.id]: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-3 py-2"
                  >
                    <option value="">Choisir un membre</option>
                    {memberList.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name || member.email} - {member.email} ({member.role})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => openConfirm(runner.id)}
                    disabled={loadingRunnerId === runner.id}
                    className="rounded-xl border px-4 py-2 font-medium disabled:opacity-50"
                  >
                    {loadingRunnerId === runner.id ? "Association..." : "Associer"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmer l’association"
        description={
          pendingRunner && pendingUser
            ? `Vous allez associer le coureur "${pendingRunner.name}" au compte "${pendingUser.name || pendingUser.email}" (${pendingUser.email}). Les sessions déjà enregistrées pour ce coureur seront rattachées à ce compte. Vérifiez bien qu’il s’agit de la bonne personne.`
            : "Vérifiez bien l’association avant de confirmer."
        }
        confirmLabel="Confirmer l’association"
        cancelLabel="Annuler"
        loading={Boolean(loadingRunnerId)}
        onCancel={closeConfirm}
        onConfirm={confirmLink}
      />
    </>
  );
}