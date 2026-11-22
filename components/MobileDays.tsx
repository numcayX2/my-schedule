"use client";

import ClassCard, { type TypeFilter } from "./ClassCard";
import { CLASSES, DAYS, type DayId } from "./schedule-data";
import type { NowState } from "./schedule-time";
import useDayNavigation from "./useDayNavigation";

const BY_DAY = DAYS.map((day) => ({
  ...day,
  classes: CLASSES.filter((s) => s.day === day.id).sort((a, b) => a.start.localeCompare(b.start)),
}));

export default function MobileDays({
  now,
  filter,
  onOpen,
}: {
  now: NowState | null;
  filter: TypeFilter;
  onOpen: (code: string, trigger: HTMLElement) => void;
}) {
  const { dayRefs, activeDay, scrollToDay } = useDayNavigation();
  const todayIndex = now?.todayIndex ?? -1;

  return (
    <div className="mobile-days">
      <nav className="mobile-tabs" aria-label="เลือกวัน">
        {DAYS.map((day, i) => (
          <button
            key={day.id}
            type="button"
            className={`${i === todayIndex ? "is-today" : ""}`}
            aria-current={activeDay === day.id ? "true" : undefined}
            onClick={() => scrollToDay(day.id as DayId)}
          >
            <span>{day.label.slice(0, 3)}</span>
          </button>
        ))}
      </nav>

      {BY_DAY.map((day, i) => (
        <section
          key={day.id}
          className="mobile-day"
          aria-labelledby={`m-${day.id}`}
          ref={(el) => {
            dayRefs.current[day.id] = el;
          }}
        >
          <h2 id={`m-${day.id}`} className="mobile-day-head">
            <b>{day.label.slice(0, 3)}</b>
            <span>
              {day.name}
              {i === todayIndex ? " · วันนี้" : ""}
            </span>
            {i === todayIndex && <span className="sticker">TODAY</span>}
          </h2>
          {day.classes.length ? (
            day.classes.map((s, j) => (
              <ClassCard
                key={s.start}
                session={s}
                index={j}
                isNow={now?.current === s}
                filter={filter}
                onOpen={onOpen}
              />
            ))
          ) : (
            <div className="no-class">
              <b>NO CLASS</b>
              <span>ไม่มีคาบเรียน</span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
