import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import RunnerUserLinkSection from "@/components/club/RunnerUserLinkSection";
import type {LinkedRunner, Membership, UnlinkedRunner} from "@/lib/types";

type Props = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ClubAssociationsPage({params}: Props) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const {clubId} = await params;

  const membership: Membership | null = await prisma.membership.findUnique({
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

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    return <div>Vous n’avez pas les droits pour gérer les associations.</div>;
  }

  const unlinkedRunners: UnlinkedRunner[] = await prisma.runner.findMany({
    where: {
      clubId,
      userId: null,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      active: true,
      createdAt: true,
      _count: {
        select: {
          sessions: true,
        },
      },
    },
  });

  const linkedRunners: LinkedRunner[] = await prisma.runner.findMany({
    where: {
      clubId,
      userId: {
        not: null,
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      active: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          sessions: true,
        },
      },
    },
  });

  const usedUserIds = linkedRunners
    .map((runner) => runner.userId)
    .filter((value): value is string => Boolean(value));

  const availableMembers = await prisma.membership.findMany({
    where: {
      clubId,
      userId: {
        notIn: usedUserIds.length > 0 ? usedUserIds : undefined,
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      role: true,
    },
  });

  const members = availableMembers.map((item) => ({
    id: item.user.id,
    name: item.user.name,
    email: item.user.email,
    role: item.role,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Associations coureurs / comptes</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Associez un compte utilisateur à un coureur existant pour lui rattacher
          ses anciennes sessions, ou dissociez-le en cas d’erreur.
        </p>
      </div>

      <RunnerUserLinkSection
        clubId={clubId}
        runners={unlinkedRunners.map((runner) => ({
          id: runner.id,
          name: runner.name,
          active: runner.active,
          createdAt: runner.createdAt,
          sessionsCount: runner._count.sessions,
        }))}
        members={members}
        linkedRunners={linkedRunners.map((runner) => ({
          id: runner.id,
          name: runner.name,
          active: runner.active,
          createdAt: runner.createdAt,
          sessionsCount: runner._count.sessions,
          user: runner.user
            ? {
              id: runner.user.id,
              name: runner.user.name,
              email: runner.user.email,
            }
            : null,
        }))}
      />
    </div>
  );
}