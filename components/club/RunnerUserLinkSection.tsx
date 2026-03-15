"use client";

import {useMemo, useState} from "react";
import ConfirmModal from "@/components/ConfirmModal";
import BrutalButton from "@/components/BrutalButton";

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

type LinkedRunnerItem = RunnerItem & {
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type Props = {
  clubId: string;
  runners: RunnerItem[];
  members: MemberItem[];
  linkedRunners: LinkedRunnerItem[];
};

export default function RunnerUserLinkSection({
                                                clubId,
                                                runners,
                                                members,
                                                linkedRunners,
                                              }: Props) {
  const [runnerList, setRunnerList] = useState<RunnerItem[]>(runners);
  const [memberList, setMemberList] = useState<MemberItem[]>(members);
  const [linkedRunnerList, setLinkedRunnerList] =
    useState<LinkedRunnerItem[]>(linkedRunners);

  const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});
  const [loadingRunnerId, setLoadingRunnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmLinkOpen, setConfirmLinkOpen] = useState(false);
  const [pendingRunnerId, setPendingRunnerId] = useState<string | null>(null);

  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);
  const [pendingUnlinkRunnerId, setPendingUnlinkRunnerId] = useState<string | null>(null);

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

  const pendingLinkedRunner = useMemo(() => {
    if (!pendingUnlinkRunnerId) return null;
    return (
      linkedRunnerList.find((runner) => runner.id === pendingUnlinkRunnerId) ?? null
    );
  }, [pendingUnlinkRunnerId, linkedRunnerList]);

  function openConfirmLink(runnerId: string) {
    const userId = selectedUsers[runnerId];

    if (!userId) {
      setError("Sélectionnez un membre à associer.");
      return;
    }

    setError(null);
    setPendingRunnerId(runnerId);
    setConfirmLinkOpen(true);
  }

  function closeConfirmLink() {
    if (loadingRunnerId) return;
    setConfirmLinkOpen(false);
    setPendingRunnerId(null);
  }

  async function confirmLink() {
    if (!pendingRunnerId) return;

    const userId = selectedUsers[pendingRunnerId];

    if (!userId) {
      setError("Sélectionnez un membre à associer.");
      setConfirmLinkOpen(false);
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

      const linkedMember = memberList.find((member) => member.id === userId) ?? null;
      const linkedRunner = runnerList.find((runner) => runner.id === pendingRunnerId);

      if (linkedRunner && linkedMember) {
        setLinkedRunnerList((prev) => [
          ...prev,
          {
            ...linkedRunner,
            user: {
              id: linkedMember.id,
              name: linkedMember.name,
              email: linkedMember.email,
            },
          },
        ]);
      }

      setRunnerList((prev) => prev.filter((runner) => runner.id !== pendingRunnerId));
      setMemberList((prev) => prev.filter((member) => member.id !== userId));
      setSelectedUsers((prev) => {
        const next = {...prev};
        delete next[pendingRunnerId];
        return next;
      });

      setConfirmLinkOpen(false);
      setPendingRunnerId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingRunnerId(null);
    }
  }

  function openConfirmUnlink(runnerId: string) {
    setError(null);
    setPendingUnlinkRunnerId(runnerId);
    setConfirmUnlinkOpen(true);
  }

  function closeConfirmUnlink() {
    if (loadingRunnerId) return;
    setConfirmUnlinkOpen(false);
    setPendingUnlinkRunnerId(null);
  }

  async function confirmUnlink() {
    if (!pendingUnlinkRunnerId) return;

    setLoadingRunnerId(pendingUnlinkRunnerId);
    setError(null);

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/runners/${pendingUnlinkRunnerId}/unlink-user`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de dissocier le coureur");
      }

      const unlinkedRunner =
        linkedRunnerList.find((runner) => runner.id === pendingUnlinkRunnerId) ?? null;

      if (unlinkedRunner) {
        setRunnerList((prev) => [
          ...prev,
          {
            id: unlinkedRunner.id,
            name: unlinkedRunner.name,
            active: unlinkedRunner.active,
            createdAt: unlinkedRunner.createdAt,
            sessionsCount: unlinkedRunner.sessionsCount,
          },
        ]);

        if (unlinkedRunner.user) {
          setMemberList((prev) => [
            ...prev,
            {
              id: unlinkedRunner.user!.id,
              name: unlinkedRunner.user!.name,
              email: unlinkedRunner.user!.email,
              role: "USER",
            },
          ]);
        }
      }

      setLinkedRunnerList((prev) =>
        prev.filter((runner) => runner.id !== pendingUnlinkRunnerId)
      );

      setConfirmUnlinkOpen(false);
      setPendingUnlinkRunnerId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingRunnerId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border bg-[var(--card)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Runners non liés</h2>

          <div className="mt-4 space-y-4">
            {runnerList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Tous les runners sont déjà associés.
              </p>
            ) : (
              runnerList.map((runner) => (
                <div key={runner.id} className="rounded-xl border p-4">
                  <div className="mb-3">
                    <p className="font-medium">{runner.name}</p>
                    <p className="text-sm text-neutral-600">
                      {runner.sessionsCount} session
                      {runner.sessionsCount > 1 ? "s" : ""}
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
                      className="rounded-xl border px-3 py-2 bg-[var(--card)]"
                    >
                      <option value="">Choisir un membre</option>
                      {memberList.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name || member.email} - {member.email} ({member.role})
                        </option>
                      ))}
                    </select>

                    <BrutalButton
                      type="button"
                      onClickFn={() => openConfirmLink(runner.id)}
                      disabled={loadingRunnerId === runner.id}
                      label={loadingRunnerId === runner.id ? "Association..." : "Associer"}
                    >
                    </BrutalButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--card)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Associations existantes</h2>

          <div className="mt-4 space-y-4">
            {linkedRunnerList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Aucune association existante.
              </p>
            ) : (
              linkedRunnerList.map((runner) => (
                <div key={runner.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{runner.name}</p>
                      <p className="text-sm text-neutral-600">
                        {runner.user?.name || runner.user?.email} - {runner.user?.email}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {runner.sessionsCount} session
                        {runner.sessionsCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <BrutalButton
                      type="button"
                      onClickFn={() => openConfirmUnlink(runner.id)}
                      disabled={loadingRunnerId === runner.id}
                      label={loadingRunnerId === runner.id ? "Dissociation..." : "Dissocier"}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <ConfirmModal
        open={confirmLinkOpen}
        title="Confirmer l’association"
        description={
          pendingRunner && pendingUser
            ? `Vous allez associer le coureur "${pendingRunner.name}" au compte "${pendingUser.name || pendingUser.email}" (${pendingUser.email}). Les sessions déjà enregistrées pour ce coureur seront rattachées à ce compte. Vérifiez bien qu’il s’agit de la bonne personne.`
            : "Vérifiez bien l’association avant de confirmer."
        }
        label="Chargement"
        confirmLabel="Confirmer l’association"
        cancelLabel="Annuler"
        loading={Boolean(loadingRunnerId)}
        onCancel={closeConfirmLink}
        onConfirm={confirmLink}
      />

      <ConfirmModal
        open={confirmUnlinkOpen}
        title="Confirmer la dissociation"
        description={
          pendingLinkedRunner?.user
            ? `Vous allez dissocier le coureur "${pendingLinkedRunner.name}" du compte "${pendingLinkedRunner.user.name || pendingLinkedRunner.user.email}" (${pendingLinkedRunner.user.email}). Les sessions resteront attachées au coureur, mais ce compte ne lui sera plus lié.`
            : "Confirmez la dissociation."
        }
        label="Chargement"
        confirmLabel="Confirmer la dissociation"
        cancelLabel="Annuler"
        loading={Boolean(loadingRunnerId)}
        onCancel={closeConfirmUnlink}
        onConfirm={confirmUnlink}
      />
    </>
  );
}