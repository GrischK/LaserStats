"use client";

import { useState } from "react";
import SessionForm from "@/components/SessionForm";
import RunnerHistoryAccordion from "@/components/RunnerHistoryAccordion";

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
  clubId: string;
  runnerId: string;
  canManage: boolean;
  groupedSessions: MonthGroup[];
};

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function addSessionToGroups(
  groups: MonthGroup[],
  newSession: SessionItem
): MonthGroup[] {
  const date = new Date(newSession.createdAt);

  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

  const nextGroups = structuredClone(groups) as MonthGroup[];

  const monthIndex = nextGroups.findIndex((month) => month.monthKey === monthKey);

  if (monthIndex === -1) {
    return [
      {
        monthKey,
        monthLabel: formatMonthLabel(date),
        days: [
          {
            dayKey,
            dayLabel: formatDayLabel(date),
            sessions: [newSession],
          },
        ],
      },
      ...nextGroups,
    ];
  }

  const month = nextGroups[monthIndex];
  const dayIndex = month.days.findIndex((day) => day.dayKey === dayKey);

  if (dayIndex === -1) {
    month.days.unshift({
      dayKey,
      dayLabel: formatDayLabel(date),
      sessions: [newSession],
    });
  }
  else {
    month.days[dayIndex].sessions.unshift(newSession);
    month.days[dayIndex].sessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  nextGroups.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  nextGroups.forEach((group) =>
    group.days.sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  );

  return nextGroups;
}

export default function RunnerSessionsPanel({
                                              clubId,
                                              runnerId,
                                              canManage,
                                              groupedSessions,
                                            }: Props) {
  const [history, setHistory] = useState<MonthGroup[]>(groupedSessions);

  function handleSessionCreated(session: SessionItem) {
    setHistory((prev) => addSessionToGroups(prev, session));
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

  return (
    <>
      {canManage && (
        <SessionForm
          clubId={clubId}
          runnerId={runnerId}
          onCreated={handleSessionCreated}
        />
      )}

      <section className="-mx-4 border-y border-[var(--border)] bg-[var(--card)] px-4 py-5 sm:mx-0 sm:rounded-2xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Historique</h2>
        <RunnerHistoryAccordion
          groupedSessions={history}
          clubId={clubId}
          runnerId={runnerId}
          canManage={canManage}
          onSessionUpdated={handleSessionUpdated}
          onSessionDeleted={handleSessionDeleted}
        />
      </section>
    </>
  );
}
