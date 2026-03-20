"use client";

import { useMemo, useState } from "react";
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
    <div className="rounded-2xl border bg-[var(--card)] p-4 shadow-sm">
      <h2 className="text-base font-semibold">Membres du club</h2>

      <div className="mt-4 space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucun membre.</p>
        ) : (
          members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const canRemove =
              canManageMembers && !isCurrentUser && loadingUserId === null;

            return (
              <div
                key={member.userId}
                className="flex items-start justify-between gap-3 rounded-xl border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={`Avatar de ${member.user.name ?? member.user.email}`}
                        className="h-8 w-8 rounded-full border object-cover"
                      />
                    ) : null}
                    <p className="truncate font-medium">
                      {member.user.name ?? member.user.email}
                      {isCurrentUser ? " (vous)" : ""}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-600">{member.user.email}</p>
                  <p className="text-sm text-neutral-500">
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
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

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
    </div>
  );
}
