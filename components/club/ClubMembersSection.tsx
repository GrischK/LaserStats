"use client";

import { useMemo, useState } from "react";
import {ChevronDown} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import BrutalButton from "@/components/BrutalButton";
import type { ClubMemberItem } from "@/lib/types";

type Props = {
  clubId: string;
  currentUserId: string;
  canManageMembers: boolean;
  initialMembers: ClubMemberItem[];
};

function roleLabel(role: ClubMemberItem["role"]) {
  if (role === "ADMIN") return "Admin";
  if (role === "COACH") return "Coach";
  return "Utilisateur";
}

export default function ClubMembersSection({
  clubId,
  currentUserId,
  canManageMembers,
  initialMembers,
}: Props) {
  const [members, setMembers] = useState<ClubMemberItem[]>(initialMembers);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const pendingMember = useMemo(
    () => members.find((item) => item.userId === pendingUserId) ?? null,
    [members, pendingUserId]
  );

  function openConfirm(memberUserId: string) {
    setError(null);
    setPendingUserId(memberUserId);
  }

  function closeConfirm() {
    if (loadingUserId) return;
    setPendingUserId(null);
  }

  async function confirmRemove() {
    if (!pendingUserId) return;

    setLoadingUserId(pendingUserId);
    setError(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/members/${pendingUserId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de retirer ce membre");
      }

      setMembers((prev) => prev.filter((item) => item.userId !== pendingUserId));
      setPendingUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoadingUserId(null);
    }
  }

  return (
    <section className="-mx-4 sm:border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Membres du club</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {members.length} membre{members.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--fg)]">
          <ChevronDown
            size={22}
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-4 sm:space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aucun membre.</p>
            ) : (
              members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canRemove =
                  canManageMembers && !isCurrentUser && loadingUserId === null;

                return (
                  <div
                    key={member.userId}
                    className="flex flex-col gap-3 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:rounded-xl sm:border sm:p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {member.user.image ? (
                          <img
                            src={member.user.image}
                            alt={`Avatar de ${member.user.name ?? member.user.email}`}
                            className="h-9 w-9 rounded-full border border-[var(--border)] object-cover"
                          />
                        ) : null}
                        <p className="truncate font-medium">
                          {member.user.name ?? member.user.email}
                          {isCurrentUser ? " (vous)" : ""}
                        </p>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">{member.user.email}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Rôle : {roleLabel(member.role)}
                      </p>
                    </div>

                    {canManageMembers && !isCurrentUser ? (
                      <BrutalButton
                        type="button"
                        onClickFn={() => openConfirm(member.userId)}
                        disabled={!canRemove}
                        label={
                          loadingUserId === member.userId ? "Retrait..." : "Retirer"
                        }
                        variant="danger"
                        className="w-full sm:w-auto"
                      />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}

      <ConfirmModal
        open={Boolean(pendingMember)}
        title="Retirer ce membre du club ?"
        description={
          pendingMember
            ? `Le compte "${pendingMember.user.name ?? pendingMember.user.email}" perdra l'accès au club, mais son compte ne sera pas supprimé.`
            : undefined
        }
        confirmLabel="Retirer"
        label="Retrait..."
        loading={Boolean(loadingUserId)}
        onCancel={closeConfirm}
        onConfirm={confirmRemove}
      />
    </section>
  );
}
