"use client";

import { useState } from "react";

type SessionItem = {
  id: string;
  createdAt: Date | string;
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

type Props = {
  groupedSessions: MonthGroup[];
};

export default function RunnerHistoryAccordion({ groupedSessions }: Props) {
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>(
    Object.fromEntries(groupedSessions.map((month, index) => [month.monthKey, index === 0]))
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
    return <p className="text-sm text-gray-600">Aucune session enregistrée.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {groupedSessions.map((month) => {
        const isMonthOpen = !!openMonths[month.monthKey];

        return (
          <div key={month.monthKey} className="overflow-hidden rounded-2xl border">
            <button
              type="button"
              onClick={() => toggleMonth(month.monthKey)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
            >
              <div>
                <div className="text-lg font-semibold capitalize">{month.monthLabel}</div>
                <div className="text-sm text-gray-600">
                  {month.days.length} jour{month.days.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="text-xl">{isMonthOpen ? "−" : "+"}</div>
            </button>

            {isMonthOpen && (
              <div className="border-t p-4">
                <div className="flex flex-col gap-3">
                  {month.days.map((day) => {
                    const isDayOpen = !!openDays[day.dayKey];
                    const average =
                      day.sessions.reduce((sum, item) => sum + item.targetsHit, 0) / day.sessions.length;

                    return (
                      <div key={day.dayKey} className="overflow-hidden rounded-xl border">
                        <button
                          type="button"
                          onClick={() => toggleDay(day.dayKey)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                        >
                          <div>
                            <div className="font-medium capitalize">{day.dayLabel}</div>
                            <div className="text-sm text-gray-600">
                              {day.sessions.length} session{day.sessions.length > 1 ? "s" : ""} . moyenne{" "}
                              {average.toFixed(1)} cible{average > 1 ? "s" : ""}
                            </div>
                          </div>

                          <div className="text-lg">{isDayOpen ? "−" : "+"}</div>
                        </button>

                        {isDayOpen && (
                          <div className="border-t p-3">
                            <div className="grid gap-2">
                              {day.sessions.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex flex-col gap-1 rounded-xl border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="font-medium">
                                    {item.distance != null ? `${item.distance} m` : "Distance non renseignée"}
                                  </div>

                                  <div className="text-gray-700">
                                    {item.targetsHit} cible{item.targetsHit > 1 ? "s" : ""} touchée
                                    {item.targetsHit > 1 ? "s" : ""}
                                  </div>

                                  <div className="text-gray-500">
                                    {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
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