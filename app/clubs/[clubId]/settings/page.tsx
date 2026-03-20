import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import {getInvitableRoles} from "@/lib/invitations/permissions";
import {listClubInvitations} from "@/lib/invitations/list-club-invitations";
import ClubInvitationsSection from "@/components/club/ClubInvitationsSection";
import ClubMembersSection from "@/components/club/ClubMembersSection";
import type { ClubMemberItem } from "@/lib/types";

type Props = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ClubSettingsPage({params}: Props) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return <div>Non autorisé</div>;
  }

  const {clubId} = await params;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: session.user.id,
        clubId,
      },
    },
  });

  if (!membership) {
    return <div>Accès refusé</div>;
  }

  const availableRoles = getInvitableRoles(membership.role);
  const canManageMembers = membership.role === "ADMIN";

  const initialInvitations =
    availableRoles.length > 0
      ? await listClubInvitations({
        clubId,
        currentUserId: session.user.id,
      })
      : [];

  const initialMembers: ClubMemberItem[] = canManageMembers
    ? await prisma.membership.findMany({
      where: { clubId },
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        userId: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestion du club</h1>

      {availableRoles.length > 0 ? (
        <ClubInvitationsSection
          clubId={clubId}
          availableRoles={availableRoles}
          initialInvitations={initialInvitations}
        />
      ) : (
        <div className="rounded-2xl border bg-[var(--card)] p-4 shadow-sm">
          <p className="text-sm text-neutral-600">
            Vous n’avez pas les droits pour gérer les invitations.
          </p>
        </div>
      )}

      {canManageMembers ? (
        <ClubMembersSection
          clubId={clubId}
          currentUserId={session.user.id}
          canManageMembers={canManageMembers}
          initialMembers={initialMembers}
        />
      ) : null}
    </div>
  );
}
