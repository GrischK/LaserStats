import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import RunnerComparisonSelector from "@/components/runner/RunnerComparisonSelector";
import type { Membership, UserWithMemberships } from "@/lib/types";
import BrutalButton from "@/components/BrutalButton";
import {cn} from "@/lib/utils";

type Props = {
  params: Promise<{ clubId: string; runnerId: string }>;
  searchParams: Promise<{ compareRunnerId?: string }>;
};

type RunnerSessionItem = {
  id: string;
  createdAt: Date;
  sessionDay: Date;
  targetsHit: number;
  distance: number | null;
  durationSeconds: number | null;
};

type MonthlyStat = {
  key: string;
  label: string;
  count: number;
  avgTargets: number | null;
};

type RunnerStats = {
  totalSessions: number;
  avgTargets: number | null;
  successRate: number | null;
  avgDistance: number | null;
  avgDuration: number | null;
  durationSessionsCount: number;
  bestTargets: number | null;
  bestDistance: number | null;
  fastestDuration: number | null;
  lastSessionDate: Date | null;
  scoreDistribution: { score: number; count: number }[];
  distanceDistribution: { label: string; count: number }[];
  weekdayCounts: { label: string; count: number }[];
  favoriteWeekday: { label: string; count: number } | null;
  weekly: {
    activeWeeksCount: number;
    weeklyActiveRate: number;
    weeklyFrequency: number;
    activeWeeksLast4: number;
    gapAverageDays: number | null;
    gapMaxDays: number | null;
    dayKeysCount: number;
  };
  monthlyStats: MonthlyStat[];
  rollingStats: { date: Date; avgTargets: number }[];
  delta30: {
    last30Count: number;
    prev30Count: number;
    scoreDelta: number | null;
  };
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

function formatSigned(value: number | null, digits = 2, suffix = "") {
  if (value === null || Number.isNaN(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}${suffix}`;
}

const sectionCard =
  "-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-6 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]";

const statPanel =
  "-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-5 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]";

const nestedPanel =
  "border-l-4 border-[var(--accent-sport)] bg-[var(--muted)]/45 px-3 py-3 sm:rounded-xl sm:border sm:border-[var(--border)] sm:bg-transparent";

const barFill = "h-2 rounded bg-[image:var(--accent-gradient)]";

function getSessionDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStartKey(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return getSessionDayKey(d);
}

function getWeekday(date: Date) {
  return date.getDay();
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function getLastMonthKeys(monthsBack: number) {
  const now = new Date();
  const keys: string[] = [];

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(getMonthKey(d));
  }

  return keys;
}

function computeRunnerStats(
  sessions: RunnerSessionItem[],
  monthKeys: string[]
): RunnerStats {
  const totalSessions = sessions.length;
  const scoreValues = sessions.map((item) => item.targetsHit);
  const distanceValues = sessions
    .map((item) => item.distance)
    .filter((value): value is number => value !== null);
  const durationValues = sessions
    .map((item) => item.durationSeconds)
    .filter((value): value is number => value !== null);

  const avgTargets = avg(scoreValues);
  const successRate = avgTargets === null ? null : avgTargets / 5;
  const avgDistance = avg(distanceValues);
  const avgDuration = avg(durationValues);

  const bestTargets = scoreValues.length > 0 ? Math.max(...scoreValues) : null;
  const bestDistance = distanceValues.length > 0 ? Math.max(...distanceValues) : null;
  const fastestDuration = durationValues.length > 0 ? Math.min(...durationValues) : null;
  const lastSessionDate = totalSessions > 0 ? sessions[sessions.length - 1].createdAt : null;

  const scoreDistribution = [0, 1, 2, 3, 4, 5].map((score) => ({
    score,
    count: sessions.filter((item) => item.targetsHit === score).length,
  }));

  const distanceMap = new Map<string, number>();
  for (const item of sessions) {
    if (item.distance === null) continue;
    const key = `${item.distance}m`;
    distanceMap.set(key, (distanceMap.get(key) ?? 0) + 1);
  }
  const distanceDistribution = Array.from(distanceMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const weekdayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const weekdayCounts = weekdayLabels.map((label, dayIndex) => ({
    label,
    count: sessions.filter((item) => getWeekday(new Date(item.sessionDay)) === dayIndex).length,
  }));
  const favoriteWeekday = [...weekdayCounts].sort((a, b) => b.count - a.count)[0] ?? null;

  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));

  const weekActivityMap = new Map<string, number>();
  for (const item of sessions) {
    const key = getWeekStartKey(new Date(item.sessionDay));
    weekActivityMap.set(key, (weekActivityMap.get(key) ?? 0) + 1);
  }

  const last12WeekKeys = Array.from({ length: 12 }, (_, index) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - index * 7);
    return getWeekStartKey(d);
  });
  const activeWeeksCount = last12WeekKeys.filter((key) => (weekActivityMap.get(key) ?? 0) > 0).length;
  const weeklyActiveRate = activeWeeksCount / 12;
  const sessionsLast12Weeks = last12WeekKeys.reduce(
    (sum, key) => sum + (weekActivityMap.get(key) ?? 0),
    0
  );
  const weeklyFrequency = sessionsLast12Weeks / 12;

  const last4WeekKeys = Array.from({ length: 4 }, (_, index) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - index * 7);
    return getWeekStartKey(d);
  });
  const activeWeeksLast4 = last4WeekKeys.filter(
    (key) => (weekActivityMap.get(key) ?? 0) > 0
  ).length;

  const uniqueDayKeys = Array.from(
    new Set(sessions.map((item) => getSessionDayKey(new Date(item.sessionDay))))
  ).sort();
  const dayGaps: number[] = [];
  for (let i = 1; i < uniqueDayKeys.length; i += 1) {
    const prev = new Date(`${uniqueDayKeys[i - 1]}T00:00:00`);
    const curr = new Date(`${uniqueDayKeys[i]}T00:00:00`);
    dayGaps.push(Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const monthMap = new Map<string, RunnerSessionItem[]>();
  for (const item of sessions) {
    const key = getMonthKey(new Date(item.createdAt));
    if (!monthMap.has(key)) {
      monthMap.set(key, []);
    }
    monthMap.get(key)!.push(item);
  }
  const monthlyStats = monthKeys.map((key) => {
    const monthSessions = monthMap.get(key) ?? [];
    return {
      key,
      label: new Date(`${key}-01T00:00:00`).toLocaleDateString("fr-FR", {
        month: "short",
      }),
      count: monthSessions.length,
      avgTargets: avg(monthSessions.map((item) => item.targetsHit)),
    };
  });

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

  return {
    totalSessions,
    avgTargets,
    successRate,
    avgDistance,
    avgDuration,
    durationSessionsCount: durationValues.length,
    bestTargets,
    bestDistance,
    fastestDuration,
    lastSessionDate,
    scoreDistribution,
    distanceDistribution,
    weekdayCounts,
    favoriteWeekday,
    weekly: {
      activeWeeksCount,
      weeklyActiveRate,
      weeklyFrequency,
      activeWeeksLast4,
      gapAverageDays: avg(dayGaps),
      gapMaxDays: dayGaps.length > 0 ? Math.max(...dayGaps) : null,
      dayKeysCount: uniqueDayKeys.length,
    },
    monthlyStats,
    rollingStats,
    delta30: {
      last30Count: last30.length,
      prev30Count: prev30.length,
      scoreDelta,
    },
  };
}

export default async function RunnerStatsPage({ params, searchParams }: Props) {
  const { clubId, runnerId } = await params;
  const { compareRunnerId } = await searchParams;
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

  const [runner, compareCandidates] = await Promise.all([
    prisma.runner.findFirst({
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
    }),
    prisma.runner.findMany({
      where: {
        clubId,
        active: true,
        id: {
          not: runnerId,
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!runner) {
    redirect(`/clubs/${clubId}`);
  }

  const selectedCompareRunnerId =
    typeof compareRunnerId === "string" && compareRunnerId.trim()
      ? compareRunnerId.trim()
      : null;

  const validCompareRunnerId =
    selectedCompareRunnerId &&
    compareCandidates.some((item) => item.id === selectedCompareRunnerId)
      ? selectedCompareRunnerId
      : null;

  const compareRunner = validCompareRunnerId
    ? await prisma.runner.findFirst({
      where: {
        id: validCompareRunnerId,
        clubId,
        active: true,
      },
      include: {
        sessions: {
          orderBy: { createdAt: "asc" },
        },
      },
    })
    : null;

  const monthKeys = getLastMonthKeys(6);
  const baseStats = computeRunnerStats(
    runner.sessions as RunnerSessionItem[],
    monthKeys
  );
  const compareStats = compareRunner
    ? computeRunnerStats(compareRunner.sessions as RunnerSessionItem[], monthKeys)
    : null;

  const maxScoreDistCount = Math.max(
    1,
    ...baseStats.scoreDistribution.map((item) => item.count)
  );
  const maxDistanceDistCount = Math.max(
    1,
    ...baseStats.distanceDistribution.map((item) => item.count),
    1
  );
  const maxWeekdayCount = Math.max(1, ...baseStats.weekdayCounts.map((item) => item.count), 1);
  const maxMonthlyCount = Math.max(1, ...baseStats.monthlyStats.map((item) => item.count), 1);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col sm:gap-6">
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--accent-sport)]">
              Statistiques
            </p>
            <div className="mt-2 flex items-center gap-3">
              {runner.user?.image ? (
                <img
                  src={runner.user.image}
                  alt={`Avatar de ${runner.name}`}
                  className="h-12 w-12 rounded-full border border-[var(--border)] object-cover"
                />
              ) : null}
              <h1 className="min-w-0 break-words text-4xl font-black leading-tight tracking-tight">{runner.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <BrutalButton
              href={`/clubs/${clubId}/runners/${runnerId}`}
              label="Retour sessions"
              variant="soft"
              className="min-h-11 px-4 py-2"
            />
            <BrutalButton
              href={`/clubs/${clubId}`}
              label="Retour club"
              variant="soft"
              className="min-h-11 px-4 py-2"
            />
          </div>
        </div>
      </section>

      <RunnerComparisonSelector
        selectedRunnerId={validCompareRunnerId}
        runners={compareCandidates}
      />

      {compareRunner && compareStats ? (
        <section className={sectionCard}>
          <h2 className="text-lg font-semibold">Comparaison avec {compareRunner.name}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className={nestedPanel}>
              <p className="text-sm font-medium">{runner.name}</p>
              <p className="mt-2 text-sm">Moy. score: <strong>{formatNumber(baseStats.avgTargets, 2)}/5</strong></p>
              <p className="text-sm">Taux réussite: <strong>{baseStats.successRate === null ? "N/A" : toPercent(baseStats.successRate)}</strong></p>
              <p className="text-sm">Fréquence: <strong>{formatNumber(baseStats.weekly.weeklyFrequency, 2)} / sem.</strong></p>
              <p className="text-sm">Distance moy.: <strong>{baseStats.avgDistance === null ? "N/A" : `${formatNumber(baseStats.avgDistance, 1)}m`}</strong></p>
              <p className="text-sm">Durée moy.: <strong>{formatDuration(baseStats.avgDuration === null ? null : Number(baseStats.avgDuration.toFixed(1)))}</strong></p>
            </div>

            <div className={nestedPanel}>
              <p className="text-sm font-medium">{compareRunner.name}</p>
              <p className="mt-2 text-sm">Moy. score: <strong>{formatNumber(compareStats.avgTargets, 2)}/5</strong></p>
              <p className="text-sm">Taux réussite: <strong>{compareStats.successRate === null ? "N/A" : toPercent(compareStats.successRate)}</strong></p>
              <p className="text-sm">Fréquence: <strong>{formatNumber(compareStats.weekly.weeklyFrequency, 2)} / sem.</strong></p>
              <p className="text-sm">Distance moy.: <strong>{compareStats.avgDistance === null ? "N/A" : `${formatNumber(compareStats.avgDistance, 1)}m`}</strong></p>
              <p className="text-sm">Durée moy.: <strong>{formatDuration(compareStats.avgDuration === null ? null : Number(compareStats.avgDuration.toFixed(1)))}</strong></p>
            </div>
          </div>

          <div className={`${nestedPanel} mt-4 text-sm`}>
            <p>Écart score moyen (Y - X): <strong>{formatSigned(compareStats.avgTargets !== null && baseStats.avgTargets !== null ? compareStats.avgTargets - baseStats.avgTargets : null, 2, " /5")}</strong></p>
            <p>Écart fréquence hebdo (Y - X): <strong>{formatSigned(compareStats.weekly.weeklyFrequency - baseStats.weekly.weeklyFrequency, 2, " /sem.")}</strong></p>
            <p>Écart distance moyenne (Y - X): <strong>{formatSigned(compareStats.avgDistance !== null && baseStats.avgDistance !== null ? compareStats.avgDistance - baseStats.avgDistance : null, 1, "m")}</strong></p>
            <p>Écart durée moyenne (Y - X): <strong>{formatSigned(compareStats.avgDuration !== null && baseStats.avgDuration !== null ? compareStats.avgDuration - baseStats.avgDuration : null, 1, "s")}</strong></p>
          </div>

          <div className={`${nestedPanel} mt-4`}>
            <h3 className="text-sm font-medium">Tendance 6 mois (sessions / score moyen)</h3>
            <div className="mt-2 space-y-2 text-sm">
              {monthKeys.map((key) => {
                const baseMonth = baseStats.monthlyStats.find((item) => item.key === key);
                const compareMonth = compareStats.monthlyStats.find((item) => item.key === key);
                return (
                  <div key={key} className="grid grid-cols-3 gap-2 border-b border-[var(--border)] px-0 py-2 last:border-b-0 sm:rounded-lg sm:border sm:px-2 sm:py-1">
                    <span className="capitalize">{baseMonth?.label ?? key}</span>
                    <span>
                      X: {baseMonth?.count ?? 0} / {formatNumber(baseMonth?.avgTargets ?? null, 1)}
                    </span>
                    <span>
                      Y: {compareMonth?.count ?? 0} / {formatNumber(compareMonth?.avgTargets ?? null, 1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-0 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={statPanel}>
          <p className="text-sm text-[var(--muted-foreground)]">Sessions totales</p>
          <p className="mt-1 text-2xl font-bold">{baseStats.totalSessions}</p>
        </div>
        <div className={statPanel}>
          <p className="text-sm text-[var(--muted-foreground)]">Moyenne score</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(baseStats.avgTargets, 2)} / 5</p>
        </div>
        <div className={statPanel}>
          <p className="text-sm text-[var(--muted-foreground)]">Taux de réussite</p>
          <p className="mt-1 text-2xl font-bold">
            {baseStats.successRate === null ? "N/A" : toPercent(baseStats.successRate)}
          </p>
        </div>
        <div className={statPanel}>
          <p className="text-sm text-[var(--muted-foreground)]">Dernière session</p>
          <p className="mt-1 text-2xl font-bold">{formatDate(baseStats.lastSessionDate)}</p>
        </div>
      </section>

      <section className="grid gap-0 sm:gap-4 lg:grid-cols-3">
        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Records</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Meilleur score: <strong>{baseStats.bestTargets ?? "N/A"} / 5</strong></p>
            <p>Distance max: <strong>{baseStats.bestDistance === null ? "N/A" : `${baseStats.bestDistance}m`}</strong></p>
            <p>Durée la plus rapide: <strong>{formatDuration(baseStats.fastestDuration)}</strong></p>
          </div>
        </div>

        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Moyennes</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Distance moyenne: <strong>{baseStats.avgDistance === null ? "N/A" : `${formatNumber(baseStats.avgDistance, 1)}m`}</strong></p>
            <p>Durée moyenne: <strong>{formatDuration(baseStats.avgDuration === null ? null : Number(baseStats.avgDuration.toFixed(1)))}</strong></p>
            <p>Sessions avec durée: <strong>{baseStats.durationSessionsCount}</strong></p>
          </div>
        </div>

        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Régularité</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              Semaines actives (12 sem.):{" "}
              <strong>{baseStats.weekly.activeWeeksCount}/12 ({toPercent(baseStats.weekly.weeklyActiveRate, 0)})</strong>
            </p>
            <p>
              Fréquence moyenne: <strong>{formatNumber(baseStats.weekly.weeklyFrequency, 2)} session/sem.</strong>
            </p>
            <p>
              Gap moyen entre sessions: <strong>{baseStats.weekly.gapAverageDays === null ? "N/A" : `${formatNumber(baseStats.weekly.gapAverageDays, 1)} jours`}</strong>
            </p>
            <p>
              Plus long gap: <strong>{baseStats.weekly.gapMaxDays === null ? "N/A" : `${baseStats.weekly.gapMaxDays} jours`}</strong>
            </p>
            <p>
              Assiduité 4 sem.: <strong>{baseStats.weekly.activeWeeksLast4}/4</strong>
            </p>
            <p>
              Jour le plus fréquent:{" "}
              <strong>{baseStats.favoriteWeekday?.count ? `${baseStats.favoriteWeekday.label} (${baseStats.favoriteWeekday.count} sessions)` : "N/A"}</strong>
            </p>
            <p>Jours actifs (historique): <strong>{baseStats.weekly.dayKeysCount}</strong></p>
          </div>
        </div>
      </section>

      <section className="grid gap-0 sm:gap-4 lg:grid-cols-2">
        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Répartition des scores</h2>
          <div className="mt-4 space-y-2">
            {baseStats.scoreDistribution.map((item) => (
              <div key={item.score} className="flex items-center gap-3 text-sm">
                <span className="w-12">{item.score}/5</span>
                <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                  <div
                    className={barFill}
                    style={{ width: `${(item.count / maxScoreDistCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Répartition des distances</h2>
          <div className="mt-4 space-y-2">
            {baseStats.distanceDistribution.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aucune distance renseignée.</p>
            ) : (
              baseStats.distanceDistribution.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span className="w-12">{item.label}</span>
                  <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                    <div
                      className={barFill}
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

      <section className="grid gap-0 sm:gap-4 lg:grid-cols-2">
        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Activité par jour</h2>
          <div className="mt-4 space-y-2">
            {baseStats.weekdayCounts.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="w-10">{item.label}</span>
                <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                  <div
                    className={barFill}
                    style={{ width: `${(item.count / maxWeekdayCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Tendance 6 mois</h2>
          <div className="mt-4 space-y-2">
            {baseStats.monthlyStats.map((item) => (
              <div key={item.key} className="flex items-center gap-3 text-sm">
                <span className="w-12 capitalize">{item.label}</span>
                <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                  <div
                    className={barFill}
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

      <section className="grid gap-0 sm:gap-4 lg:grid-cols-2">
        <div className={statPanel}>
          <h2 className="text-lg font-semibold">Delta 30 jours</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>Sessions (30j): <strong>{baseStats.delta30.last30Count}</strong></p>
            <p>Sessions (30j précédents): <strong>{baseStats.delta30.prev30Count}</strong></p>
            <p>
              Évolution score moyen:{" "}
              <strong>
                {baseStats.delta30.scoreDelta === null
                  ? "N/A"
                  : `${baseStats.delta30.scoreDelta >= 0 ? "+" : ""}${baseStats.delta30.scoreDelta.toFixed(2)} / 5`}
              </strong>
            </p>
          </div>
        </div>

        <div className={cn(statPanel, "border-b-0 sm:border-b")}>
          <h2 className="text-lg font-semibold">Moyenne mobile (7 sessions)</h2>
          <div className="mt-4 space-y-2">
            {baseStats.rollingStats.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Pas assez de sessions pour calculer la moyenne mobile (minimum 7).
              </p>
            ) : (
              baseStats.rollingStats.slice(0, 10).map((item) => (
                <div key={item.date.toISOString()} className="flex items-center gap-3 text-sm">
                  <span className="w-24">{formatDate(item.date)}</span>
                  <div className="h-2 flex-1 rounded bg-[var(--muted)]">
                    <div
                      className={barFill}
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
