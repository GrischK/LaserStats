"use client";

import {useMemo, useState} from "react";
import {ChevronDown} from "lucide-react";
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
  const [unlinkedOpen, setUnlinkedOpen] = useState(false);

  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);
  const [pendingUnlinkRunnerId, setPendingUnlinkRunnerId] = useState<string | null>(null);
  const [linkedOpen, setLinkedOpen] = useState(false);

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
      <div className="sm:space-y-6">
        <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
          <button
            type="button"
            onClick={() => setUnlinkedOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Coureurs non liés</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {runnerList.length} coureur{runnerList.length > 1 ? "s" : ""} à associer
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--fg)]">
              <ChevronDown
                size={22}
                aria-hidden="true"
                className={`transition-transform duration-200 ${unlinkedOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              unlinkedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-4 sm:space-y-3">
                {runnerList.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Tous les coureurs sont déjà associés.
                  </p>
                ) : (
                  runnerList.map((runner) => (
                    <div
                      key={runner.id}
                      className="border-b border-[var(--border)] py-4 last:border-b-0 sm:rounded-xl sm:border sm:p-4"
                    >
                      <div className="mb-3">
                        <p className="font-medium">{runner.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
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
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20 md:flex-1"
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
                          variant="primary"
                          className="w-full md:w-auto"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="-mx-4 md:border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
          <button
            type="button"
            onClick={() => setLinkedOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Associations existantes</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {linkedRunnerList.length} association{linkedRunnerList.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--fg)]">
              <ChevronDown
                size={22}
                aria-hidden="true"
                className={`transition-transform duration-200 ${linkedOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              linkedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-4 sm:space-y-3">
                {linkedRunnerList.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Aucune association existante.
                  </p>
                ) : (
                  linkedRunnerList.map((runner) => (
                    <div
                      key={runner.id}
                      className="border-b border-[var(--border)] py-4 last:border-b-0 sm:rounded-xl sm:border sm:p-4"
                    >
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div className="min-w-0">
                          <p className="font-medium">{runner.name}</p>
                          <p className="break-words text-sm text-[var(--muted-foreground)]">
                            {runner.user?.name || runner.user?.email} - {runner.user?.email}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {runner.sessionsCount} session
                            {runner.sessionsCount > 1 ? "s" : ""}
                          </p>
                        </div>

                        <BrutalButton
                          type="button"
                          onClickFn={() => openConfirmUnlink(runner.id)}
                          disabled={loadingRunnerId === runner.id}
                          label={loadingRunnerId === runner.id ? "Dissociation..." : "Dissocier"}
                          variant="danger"
                          className="w-full sm:w-auto"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {error ? <p className="px-4 py-3 text-sm text-[var(--danger)] sm:px-0">{error}</p> : null}
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
