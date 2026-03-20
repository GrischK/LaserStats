import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import type { Membership, UserWithMemberships } from "@/lib/types";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  params: Promise<{ clubId: string; runnerId: string }>;
};

type RunnerSessionItem = {
  id: string;
  createdAt: Date;
  sessionDay: Date;
  targetsHit: number;
  distance: number | null;
  durationSeconds: number | null;
};

function avg(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatNumber(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) return "N/A";
  return value.toFixed(digits);
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "N/A";
  return `${seconds}s`;
}

function formatDate(date: Date | null) {
  if (!date) return "N/A";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getSessionDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekday(date: Date) {
  return date.getDay();
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function getLastMonthsLabels(monthsBack: number) {
  const now = new Date();
  const labels: string[] = [];

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(getMonthKey(d));
  }

  return labels;
}

function computeStreaks(dayKeysAsc: string[]) {
  if (dayKeysAsc.length === 0) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let currentRun = 1;

  for (let i = 1; i < dayKeysAsc.length; i += 1) {
    const prev = new Date(`${dayKeysAsc[i - 1]}T00:00:00`);
    const curr = new Date(`${dayKeysAsc[i]}T00:00:00`);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentRun += 1;
      if (currentRun > longest) longest = currentRun;
    } else {
      currentRun = 1;
    }
  }

  const todayKey = getSessionDayKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = getSessionDayKey(yesterdayDate);

  let current = 0;
  const lastKey = dayKeysAsc[dayKeysAsc.length - 1];

  if (lastKey === todayKey || lastKey === yesterdayKey) {
    current = 1;

    for (let i = dayKeysAsc.length - 1; i > 0; i -= 1) {
      const curr = new Date(`${dayKeysAsc[i]}T00:00:00`);
      const prev = new Date(`${dayKeysAsc[i - 1]}T00:00:00`);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest };
}

export default async function RunnerStatsPage({ params }: Props) {
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
    (item: Membership) => item.clubId === clubId
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
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!runner) {
    redirect(`/clubs/${clubId}`);
  }

  const sessions = runner.sessions as RunnerSessionItem[];
  const totalSessions = sessions.length;

  const scoreValues = sessions.map((item) => item.targetsHit);
  const distanceValues = sessions
    .map((item) => item.distance)
    .filter((value): value is number => value !== null);
  const durationValues = sessions
    .map((item) => item.durationSeconds)
    .filter((value): value is number => value !== null);

  const avgTargets = avg(scoreValues);
  const avgDistance = avg(distanceValues);
  const avgDuration = avg(durationValues);
  const successRate = avgTargets === null ? null : avgTargets / 5;

  const bestTargets = scoreValues.length > 0 ? Math.max(...scoreValues) : null;
  const bestDistance =
    distanceValues.length > 0 ? Math.max(...distanceValues) : null;
  const fastestDuration =
    durationValues.length > 0 ? Math.min(...durationValues) : null;
  const lastSessionDate =
    sessions.length > 0 ? sessions[sessions.length - 1].createdAt : null;

  const scoreDistribution = [0, 1, 2, 3, 4, 5].map((score) => ({
    score,
    count: sessions.filter((item) => item.targetsHit === score).length,
  }));
  const maxScoreDistCount = Math.max(
    1,
    ...scoreDistribution.map((item) => item.count)
  );

  const distanceMap = new Map<string, number>();
  for (const item of sessions) {
    if (item.distance === null) continue;
    const key = `${item.distance}m`;
    distanceMap.set(key, (distanceMap.get(key) ?? 0) + 1);
  }
  const distanceDistribution = Array.from(distanceMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const maxDistanceDistCount = Math.max(
    1,
    ...distanceDistribution.map((item) => item.count),
    1
  );

  const dayKeys = Array.from(
    new Set(sessions.map((item) => getSessionDayKey(new Date(item.sessionDay))))
  ).sort();
  const { current: currentStreak, longest: longestStreak } = computeStreaks(dayKeys);

  const weekdayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const weekdayCounts = weekdayLabels.map((label, dayIndex) => ({
    label,
    count: sessions.filter((item) => getWeekday(new Date(item.sessionDay)) === dayIndex).length,
  }));
  const maxWeekdayCount = Math.max(1, ...weekdayCounts.map((item) => item.count), 1);

  const monthLabels = getLastMonthsLabels(6);
  const monthMap = new Map<string, RunnerSessionItem[]>();
  for (const item of sessions) {
    const key = getMonthKey(new Date(item.createdAt));
    if (!monthMap.has(key)) {
      monthMap.set(key, []);
    }
    monthMap.get(key)!.push(item);
  }
  const monthlyStats = monthLabels.map((label) => {
    const monthSessions = monthMap.get(label) ?? [];
    const monthAvgTargets = avg(monthSessions.map((item) => item.targetsHit));
    return {
      label: new Date(`${label}-01T00:00:00`).toLocaleDateString("fr-FR", {
        month: "short",
      }),
      count: monthSessions.length,
      avgTargets: monthAvgTargets,
    };
  });
  const maxMonthlyCount = Math.max(1, ...monthlyStats.map((item) => item.count), 1);

  const recentSessionsDesc = [...sessions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const rollingWindow = 7;
  const rollingStats = recentSessionsDesc
    .slice(0, 20)
    .map((_, index, arr) => {
      const window = arr.slice(index, index + rollingWindow);
      if (window.length < rollingWindow) return null;
      return {
        date: arr[index].createdAt,
        avgTargets: avg(window.map((item) => item.targetsHit)) ?? 0,
      };
    })
    .filter((item): item is { date: Date; avgTargets: number } => item !== null);

  const now = new Date();
  const last30Start = new Date(now);
  last30Start.setDate(now.getDate() - 30);
  const prev30Start = new Date(now);
  prev30Start.setDate(now.getDate() - 60);

  const last30 = sessions.filter((item) => item.createdAt >= last30Start);
  const prev30 = sessions.filter(
    (item) => item.createdAt >= prev30Start && item.createdAt < last30Start
  );
  const last30AvgTargets = avg(last30.map((item) => item.targetsHit));
  const prev30AvgTargets = avg(prev30.map((item) => item.targetsHit));
  const scoreDelta =
    last30AvgTargets !== null && prev30AvgTargets !== null
      ? last30AvgTargets - prev30AvgTargets
      : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Statistiques
            </p>
            <div className="mt-1 flex items-center gap-3">
              {runner.user?.image ? (
                <img
                  src={runner.user.image}
                  alt={`Avatar de ${runner.name}`}
                  className="h-10 w-10 rounded-full border object-cover"
                />
              ) : null}
              <h1 className="text-3xl font-bold tracking-tight">{runner.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/clubs/${clubId}/runners/${runnerId}`}
            >
              <BrutalButton
                type="button"
                label={"Retour sessions"}
              />
            </Link>
            <Link
              href={`/clubs/${clubId}`}
            >
              <BrutalButton
                type="button"
                label={"Retour club"}
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Sessions totales</p>
          <p className="mt-1 text-2xl font-bold">{totalSessions}</p>
        </div>
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Moyenne score</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(avgTargets, 2)} / 5</p>
        </div>
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Taux de réussite</p>
          <p className="mt-1 text-2xl font-bold">
            {successRate === null ? "N/A" : toPercent(successRate)}
          </p>
        </div>
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Dernière session</p>
          <p className="mt-1 text-2xl font-bold">{formatDate(lastSessionDate)}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Records</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Meilleur score: <strong>{bestTargets ?? "N/A"} / 5</strong></p>
            <p>Distance max: <strong>{bestDistance === null ? "N/A" : `${bestDistance}m`}</strong></p>
            <p>Durée la plus rapide: <strong>{formatDuration(fastestDuration)}</strong></p>
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Moyennes</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Distance moyenne: <strong>{avgDistance === null ? "N/A" : `${formatNumber(avgDistance, 1)}m`}</strong></p>
            <p>Durée moyenne: <strong>{formatDuration(avgDuration === null ? null : Number(avgDuration.toFixed(1)))}</strong></p>
            <p>Sessions avec durée: <strong>{durationValues.length}</strong></p>
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Régularité</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Streak actuel: <strong>{currentStreak} jour(s)</strong></p>
            <p>Meilleur streak: <strong>{longestStreak} jour(s)</strong></p>
            <p>Jours actifs: <strong>{dayKeys.length}</strong></p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Répartition des scores</h2>
          <div className="mt-4 space-y-2">
            {scoreDistribution.map((item) => (
              <div key={item.score} className="flex items-center gap-3 text-sm">
                <span className="w-12">{item.score}/5</span>
                <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                  <div
                    className="h-2 rounded bg-black dark:bg-white"
                    style={{ width: `${(item.count / maxScoreDistCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Répartition des distances</h2>
          <div className="mt-4 space-y-2">
            {distanceDistribution.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aucune distance renseignée.</p>
            ) : (
              distanceDistribution.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span className="w-12">{item.label}</span>
                  <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                    <div
                      className="h-2 rounded bg-black dark:bg-white"
                      style={{ width: `${(item.count / maxDistanceDistCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Activité par jour</h2>
          <div className="mt-4 space-y-2">
            {weekdayCounts.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="w-10">{item.label}</span>
                <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                  <div
                    className="h-2 rounded bg-black dark:bg-white"
                    style={{ width: `${(item.count / maxWeekdayCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Tendance 6 mois</h2>
          <div className="mt-4 space-y-2">
            {monthlyStats.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="w-12 capitalize">{item.label}</span>
                <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                  <div
                    className="h-2 rounded bg-black dark:bg-white"
                    style={{ width: `${(item.count / maxMonthlyCount) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right">{item.count} sess.</span>
                <span className="w-16 text-right">{formatNumber(item.avgTargets, 1)}/5</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Delta 30 jours</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Sessions (30j): <strong>{last30.length}</strong></p>
            <p>Sessions (30j précédents): <strong>{prev30.length}</strong></p>
            <p>
              Évolution score moyen:{" "}
              <strong>
                {scoreDelta === null
                  ? "N/A"
                  : `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(2)} / 5`}
              </strong>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Moyenne mobile (7 sessions)</h2>
          <div className="mt-4 space-y-2">
            {rollingStats.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Pas assez de sessions pour calculer la moyenne mobile (minimum 7).
              </p>
            ) : (
              rollingStats.slice(0, 10).map((item) => (
                <div key={item.date.toISOString()} className="flex items-center gap-3 text-sm">
                  <span className="w-24">{formatDate(item.date)}</span>
                  <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                    <div
                      className="h-2 rounded bg-black dark:bg-white"
                      style={{ width: `${(item.avgTargets / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 text-right">{item.avgTargets.toFixed(2)}/5</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
