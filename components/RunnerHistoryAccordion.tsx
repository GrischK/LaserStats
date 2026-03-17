"use client";

import { useMemo, useState } from "react";
import ShotSessionRow from "@/components/ShotSessionRow";

type SessionItem = {
  id: string;
  createdAt: Date | string;
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

type Props = {
  groupedSessions: MonthGroup[];
  clubId: string;
  runnerId: string;
  canManage: boolean;
};

export default function RunnerHistoryAccordion({
                                                 groupedSessions,
                                                 clubId,
                                                 runnerId,
                                                 canManage,
                                               }: Props) {
  const [history, setHistory] = useState<MonthGroup[]>(groupedSessions);

  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>(
    Object.fromEntries(
      groupedSessions.map((month, index) => [month.monthKey, index === 0])
    )
  );

  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  function toggleMonth(monthKey: string) {
    setOpenMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  }

  function toggleDay(dayKey: string) {
    setOpenDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  }

  function handleSessionUpdated(updatedSession: SessionItem) {
    setHistory((prev) =>
      prev.map((month) => ({
        ...month,
        days: month.days.map((day) => ({
          ...day,
          sessions: day.sessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session
          ),
        })),
      }))
    );
  }

  function handleSessionDeleted(sessionId: string) {
    setHistory((prev) =>
      prev
        .map((month) => ({
          ...month,
          days: month.days
                     .map((day) => ({
                       ...day,
                       sessions: day.sessions.filter((session) => session.id !== sessionId),
                     }))
                     .filter((day) => day.sessions.length > 0),
        }))
        .filter((month) => month.days.length > 0)
    );
  }

  const visibleHistory = useMemo(() => history, [history]);

  if (visibleHistory.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--muted)] px-4 py-4 text-sm text-[var(--muted-foreground)]">
        Aucune session enregistrée.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleHistory.map((month) => {
        const isMonthOpen = !!openMonths[month.monthKey];

        return (
          <div
            key={month.monthKey}
            className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]"
          >
            <button
              type="button"
              onClick={() => toggleMonth(month.monthKey)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
            >
              <div>
                <div className="text-xl font-bold capitalize">{month.monthLabel}</div>
                <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {month.days.length} jour{month.days.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="text-2xl text-[var(--muted-foreground)]">
                {isMonthOpen ? "−" : "+"}
              </div>
            </button>

            {isMonthOpen && (
              <div className="border-t border-[var(--border)] px-4 pb-4 pt-2">
                <div className="space-y-3">
                  {month.days.map((day) => {
                    const isDayOpen = !!openDays[day.dayKey];

                    const averageTargets =
                      day.sessions.reduce((sum, item) => sum + item.targetsHit, 0) /
                      day.sessions.length;

                    const sessionsWithDuration = day.sessions.filter(
                      (item) => item.durationSeconds != null
                    );

                    const averageDuration =
                      sessionsWithDuration.length > 0
                        ? sessionsWithDuration.reduce(
                        (sum, item) => sum + (item.durationSeconds ?? 0),
                        0
                      ) / sessionsWithDuration.length
                        : null;

                    return (
                      <div key={day.dayKey} className="rounded-2xl bg-[var(--muted)]">
                        <button
                          type="button"
                          onClick={() => toggleDay(day.dayKey)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                        >
                          <div>
                            <div className="font-semibold capitalize">{day.dayLabel}</div>
                            <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {day.sessions.length} session{day.sessions.length > 1 ? "s" : ""} : moyenne{" "}
                              {averageTargets.toFixed(1)} cibles
                              {averageDuration !== null
                                ? ` . temps moyen ${averageDuration.toFixed(0)} s`
                                : ""}
                            </div>
                          </div>

                          <div className="text-xl text-[var(--muted-foreground)]">
                            {isDayOpen ? "−" : "+"}
                          </div>
                        </button>

                        {isDayOpen && (
                          <div className="px-4 pb-4">
                            <div className="space-y-2">
                              {day.sessions.map((item) => (
                                <ShotSessionRow
                                  key={item.id}
                                  sessionId={item.id}
                                  clubId={clubId}
                                  runnerId={runnerId}
                                  distance={item.distance}
                                  targetsHit={item.targetsHit}
                                  durationSeconds={item.durationSeconds}
                                  createdAt={item.createdAt}
                                  canManage={canManage}
                                  onUpdated={handleSessionUpdated}
                                  onDeleted={handleSessionDeleted}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
