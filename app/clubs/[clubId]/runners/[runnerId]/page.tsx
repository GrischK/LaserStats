import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import SessionForm from "@/components/SessionForm";
import RunnerHistoryAccordion from "@/components/RunnerHistoryAccordion";

type Props = {
  params: Promise<{ clubId: string; runnerId: string }>;
};

type SessionItem = {
  id: string;
  createdAt: Date;
  distance: number | null;
  targetsHit: number;
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
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

export default async function RunnerPage({params}: Props) {
  const {clubId, runnerId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {memberships: true},
  });

  if (!user) {
    redirect("/login");
  }

  const membership = user.memberships.find((m) => m.clubId === clubId);

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
      sessions: {
        orderBy: {createdAt: "desc"},
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
    }))
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Coureur
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{runner.name}</h1>
          </div>

          <div
            className="inline-flex w-fit rounded-full bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)]">
            Rôle : {membership.role}
          </div>
        </div>
      </section>

      {(membership.role === "ADMIN" || membership.role === "COACH") && (
        <SessionForm clubId={clubId} runnerId={runner.id}/>
      )}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] sm:p-6">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Historique</h2>
        <RunnerHistoryAccordion
          groupedSessions={groupedSessions}
          clubId={clubId}
          runnerId={runner.id}
          canManage={membership.role === "ADMIN" || membership.role === "COACH"}
        />
      </section>
    </main>
  );
}