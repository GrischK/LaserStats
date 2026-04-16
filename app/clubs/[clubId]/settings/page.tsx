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
    <main className="mx-auto flex w-full max-w-3xl flex-col sm:gap-6">
      <h1>Inviter un membre</h1>
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Invitez des membres et gérez les accès du club.
        </p>
      </section>

      {availableRoles.length > 0 ? (
        <ClubInvitationsSection
          clubId={clubId}
          availableRoles={availableRoles}
          initialInvitations={initialInvitations}
        />
      ) : (
        <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            Vous n’avez pas les droits pour gérer les invitations.
          </p>
        </section>
      )}

      {canManageMembers ? (
        <ClubMembersSection
          clubId={clubId}
          currentUserId={session.user.id}
          canManageMembers={canManageMembers}
          initialMembers={initialMembers}
        />
      ) : null}
    </main>
  );
}
