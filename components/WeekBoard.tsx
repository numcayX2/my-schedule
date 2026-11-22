"use client";

import ClassCard, { type TypeFilter } from "./ClassCard";
import { CLASSES, DAYS, getSessionGrid } from "./schedule-data";
import { END_HOUR, START_HOUR, pad2, type NowState } from "./schedule-time";

const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const SPAN_MIN = (END_HOUR - START_HOUR) * 60;

export default function WeekBoard({
  now,
  filter,
  onOpen,
}: {
  now: NowState | null;
  filter: TypeFilter;
  onOpen: (code: string, trigger: HTMLElement) => void;
}) {
  const todayIndex = now?.todayIndex ?? -1;
  const showNowLine = now && todayIndex >= 0 && now.minutes >= START_HOUR * 60 && now.minutes <= END_HOUR * 60;

  const nowPct = showNowLine ? ((now.minutes - START_HOUR * 60) / SPAN_MIN) * 100 : 0;
  const nowHour = showNowLine ? Math.floor(now.minutes / 60) : -1;

  return (
    // Frame modelled on the in-game event calendar: striped dark shell,
    // grey metal bezel with binding tabs, dark recessed viewport.
    <div className="board-shell">
      <div className="board-bezel">
        <span className="bezel-tabs" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="board" role="region" aria-label="ตารางเรียนรายสัปดาห์" tabIndex={0}>
          <div className="week">
            <div className="week-head" style={{ gridRow: 1, gridColumn: "1 / -1" }} aria-hidden="true" />
            <div className="week-corner" style={{ gridRow: 1, gridColumn: 1 }}>
              DAY / TIME
            </div>
            {HOURS.slice(0, -1).map((h, i) => (
              <div
                key={h}
                className={`week-hour${h === nowHour ? " is-now" : ""}`}
                style={{ gridRow: 1, gridColumn: `${2 + i * 2} / span 2` }}
                aria-hidden="true"
              >
                {pad2(h)}:00
              </div>
            ))}
            {showNowLine && (
              <div className="now-layer" style={{ gridRow: "1 / -1", gridColumn: "2 / -1" }} aria-hidden="true">
                <span className="now-stem" style={{ left: `${nowPct}%` }} />
                <span className="now-pill" style={{ left: `${Math.min(94, Math.max(6, nowPct))}%` }}>
                  NOW {pad2(Math.floor(now.minutes / 60))}:{pad2(now.minutes % 60)}
                </span>
              </div>
            )}

            {DAYS.map((day, i) => {
              const row = i + 2;
              const isToday = i === todayIndex;
              const hasClasses = CLASSES.some((s) => s.day === day.id);
              return (
                <div key={day.id} className="week-row" style={{ display: "contents" }}>
                  <div className={`week-day${isToday ? " is-today" : ""}`} style={{ gridRow: row, gridColumn: 1 }}>
                    {isToday && <span className="sticker">TODAY</span>}
                    <span className="day-tab">
                      <span>
                        <b>{day.label.slice(0, 3)}</b>
                        <small>{day.index}</small>
                      </span>
                    </span>
                    <span className="day-th">{day.name}</span>
                  </div>
                  <div
                    className={`week-track${isToday ? " is-today" : ""}`}
                    style={{ gridRow: row, gridColumn: "2 / -1" }}
                    aria-hidden="true"
                  />
                  {!hasClasses && (
                    <div className="no-class" style={{ gridRow: row, gridColumn: "2 / -1" }}>
                      <b>NO CLASS</b>
                      <span>ไม่มีคาบเรียน</span>
                    </div>
                  )}
                </div>
              );
            })}

            {CLASSES.map((session, i) => {
              const grid = getSessionGrid(session);
              return (
                <ClassCard
                  key={`${session.day}-${session.start}`}
                  session={session}
                  index={i}
                  isNow={now?.current === session}
                  filter={filter}
                  onOpen={onOpen}
                  style={{
                    gridRow: grid.gridRowStart,
                    gridColumn: `${grid.gridColumnStart} / ${grid.gridColumnEnd}`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
