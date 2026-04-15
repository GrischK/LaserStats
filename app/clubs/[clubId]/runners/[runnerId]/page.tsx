import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import RunnerSessionsPanel from "@/components/runner/RunnerSessionsPanel";
import type { Membership, UserWithMemberships } from "@/lib/types";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  params: Promise<{ clubId: string; runnerId: string }>;
};

type SessionItem = {
  id: string;
  createdAt: Date;
  distance: number | null;
  targetsHit: number;
  durationSeconds: number | null;
};

type DayGroup = {
  dayKey: string;
  dayLabel: string;
  sessions: SessionItem[];
};

type MonthGroup = {
  monthKey: string;
  monthLabel: string;
  days: DayGroup[];
};

function groupSessionsByMonthAndDay(sessions: SessionItem[]): MonthGroup[] {
  const monthMap = new Map<string, Map<string, SessionItem[]>>();

  for (const session of sessions) {
    const date = new Date(session.createdAt);

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map());
    }

    const dayMap = monthMap.get(monthKey)!;

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, []);
    }

    dayMap.get(dayKey)!.push(session);
  }

  return Array.from(monthMap.entries())
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([monthKey, dayMap]) => {
                const [year, month] = monthKey.split("-").map(Number);
                const monthDate = new Date(year, month - 1, 1);

                const days: DayGroup[] = Array.from(dayMap.entries())
                                              .sort((a, b) => b[0].localeCompare(a[0]))
                                              .map(([dayKey, daySessions]) => {
                                                const [dayYear, dayMonth, day] = dayKey.split("-").map(Number);
                                                const dayDate = new Date(dayYear, dayMonth - 1, day);

                                                return {
                                                  dayKey,
                                                  dayLabel: dayDate.toLocaleDateString("fr-FR", {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                  }),
                                                  sessions: daySessions.sort(
                                                    (a, b) =>
                                                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                                  ),
                                                };
                                              });

                return {
                  monthKey,
                  monthLabel: monthDate.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  }),
                  days,
                };
              });
}

export default async function RunnerPage({ params }: Props) {
  const { clubId, runnerId } = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user: UserWithMemberships | null = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    redirect("/login");
  }

  const membership = user.memberships.find(
    (m: Membership) => m.clubId === clubId
  );

  if (!membership) {
    redirect("/dashboard");
  }

  const runner = await prisma.runner.findFirst({
    where: {
      id: runnerId,
      clubId,
      active: true,
    },
    include: {
      user: {
        select: {
          image: true,
        },
      },
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 200,
      },
    },
  });

  if (!runner) {
    redirect(`/clubs/${clubId}`);
  }

  const groupedSessions = groupSessionsByMonthAndDay(
    runner.sessions.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      distance: item.distance,
      targetsHit: item.targetsHit,
      durationSeconds: item.durationSeconds,
    }))
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col sm:gap-5">
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:py-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Coureur
            </p>
            <div className="mt-1 flex items-center gap-3">
              {runner.user?.image ? (
                <img
                  src={runner.user.image}
                  alt={`Avatar de ${runner.name}`}
                  className="h-10 w-10 rounded-full border object-cover"
                />
              ) : null}
              <h1 className="text-3xl font-extrabold tracking-tight">{runner.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/*<div*/}
            {/*  className="inline-flex w-fit rounded-full bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)]"*/}
            {/*>*/}
            {/*  Rôle : {membership.role}*/}
            {/*</div>*/}
            <Link
              href={`/clubs/${clubId}/runners/${runner.id}/stats`}
              className="w-full sm:w-auto"
            >
              <BrutalButton
                type="button"
                label={"Voir les stats"}
                variant="accent"
                fullWidth
              />
            </Link>
          </div>
        </div>
      </section>

      <RunnerSessionsPanel
        clubId={clubId}
        runnerId={runner.id}
        groupedSessions={groupedSessions}
        canManage={membership.role === "ADMIN" || membership.role === "COACH"}
      />
    </main>
  );
}
