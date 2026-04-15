"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
  onSessionUpdated: (session: SessionItem) => void;
  onSessionDeleted: (sessionId: string) => void;
};

export default function RunnerHistoryAccordion({
                                                 groupedSessions,
                                                 clubId,
                                                 runnerId,
                                                 canManage,
                                                 onSessionUpdated,
                                                 onSessionDeleted,
                                               }: Props) {
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

  if (groupedSessions.length === 0) {
    return (
      <div className="rounded-lg bg-[var(--muted)] px-4 py-4 text-sm font-medium text-[var(--muted-foreground)]">
        Aucune session enregistrée.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {groupedSessions.map((month) => {
        const isMonthOpen = !!openMonths[month.monthKey];

        return (
          <div
            key={month.monthKey}
            className="overflow-hidden rounded-xl bg-[var(--card)] ring-1 ring-inset ring-[var(--border)] sm:rounded-2xl sm:shadow-[var(--shadow)]"
          >
            <button
              type="button"
              onClick={() => toggleMonth(month.monthKey)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[var(--muted)]/60"
            >
              <div>
                <div className="text-xl font-extrabold capitalize tracking-tight">{month.monthLabel}</div>
                <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {month.days.length} jour{month.days.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--fg)]">
                <ChevronDown
                  size={22}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${isMonthOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isMonthOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-[var(--border)] bg-[var(--muted)]/35">
                  <div className="divide-y divide-[var(--border)]">
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
                      <div
                        key={day.dayKey}
                        className="relative overflow-hidden bg-[var(--history-day)]"
                      >
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--accent-sport)]" />

                        <button
                          type="button"
                          onClick={() => toggleDay(day.dayKey)}
                          className="flex w-full items-stretch gap-3 text-left transition hover:bg-[var(--history-day-hover)]"
                        >
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 py-4 pl-5 pr-4">
                            <div className="min-w-0">
                            <div className="font-bold capitalize">{day.dayLabel}</div>
                            <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {day.sessions.length} session{day.sessions.length > 1 ? "s" : ""} : moyenne{" "}
                              {parseFloat(averageTargets.toFixed(2))} cibles
                              {averageDuration !== null
                                ? ` . temps moyen ${averageDuration.toFixed(0)} s`
                                : ""}
                            </div>

                            </div>

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] text-[var(--fg)]">
                            <ChevronDown
                              size={20}
                              aria-hidden="true"
                              className={`transition-transform duration-200 ${isDayOpen ? "rotate-180" : ""}`}
                            />
                            </div>
                          </div>
                        </button>

                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                            isDayOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="bg-[var(--history-day)] pb-2 pl-1.5 sm:pb-3">
                              <div className="divide-y divide-[var(--history-separator)]">
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
                                  onUpdated={onSessionUpdated}
                                  onDeleted={onSessionDeleted}
                                />
                              ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
