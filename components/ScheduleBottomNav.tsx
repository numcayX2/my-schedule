"use client";

import type { DayId } from "./schedule-data";

interface DayNavItem {
  id: DayId;
  short: string;
  name: string;
}

interface ScheduleBottomNavProps {
  days: readonly DayNavItem[];
  activeDay: DayId;
  onDayClick: (dayId: DayId) => void;
}

export default function ScheduleBottomNav({ days, activeDay, onDayClick }: ScheduleBottomNavProps) {
  return (
    <>
      <nav className="schedule-bottom-nav" aria-label="เลือกวันเรียน">
        <div className="nav-day-list">
          {days.map((day) => (
            <button
              type="button"
              className={`nav-circle-button ${activeDay === day.id ? "active" : ""}`}
              key={day.id}
              onClick={() => onDayClick(day.id)}
              aria-label={`ไปที่${day.name}`}
              aria-controls={`day-${day.id}`}
              aria-current={activeDay === day.id ? "location" : undefined}
            >
              {day.short}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
