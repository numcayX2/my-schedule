"use client";

interface DayNavItem {
  id: string;
  label: string;
}

interface ScheduleBottomNavProps {
  days: DayNavItem[];
  activeDay: string;
  onDayClick: (dayId: string) => void;
}

const NAV_CSS = `
  .schedule-bottom-nav {
    position: fixed;
    left: 50%;
    bottom: max(12px, env(safe-area-inset-bottom));
    transform: translateX(-50%);
    display: none;
    align-items: stretch;
    width: min(calc(100vw - 26px), 430px);
    height: 62px;
    padding: 7px 6px 5px;
    color: var(--paper);
    background: var(--ink);
    border: 2px solid #777970;
    box-shadow: 8px 9px 0 rgba(0,0,0,.42);
    z-index: 1000;
  }
  .schedule-bottom-nav::before {
    content: "DAY";
    width: 43px;
    display: grid;
    place-items: center;
    color: var(--ink);
    background:
      repeating-linear-gradient(-45deg, rgba(18,19,16,.12) 0 4px, transparent 4px 8px),
      var(--orange);
    font: 900 8px/1 var(--font-mono);
    letter-spacing: .08em;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%);
  }
  .schedule-bottom-nav::after {
    content: "";
    position: absolute;
    top: 0;
    left: 50px;
    right: 7px;
    height: 3px;
    background: repeating-linear-gradient(90deg, var(--acid) 0 7px, transparent 7px 11px);
  }
  .nav-day-list {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    position: relative;
    background-image: linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
    background-size: 20% 100%;
  }
  .nav-circle-button {
    min-width: 0;
    padding: 0;
    color: #777970;
    background: transparent;
    border: 0;
    font: 900 10px/1 var(--font-mono);
    letter-spacing: .06em;
    position: relative;
    z-index: 1;
    transition: color .12s ease, background .12s ease, box-shadow .12s ease, transform .12s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-circle-button.active {
    color: var(--ink);
    background: var(--acid);
    box-shadow: inset 0 -4px 0 var(--orange), 2px 2px 0 var(--orange);
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  }
  .nav-circle-button:active { transform: scale(.9); }
  @media (max-width: 768px) { .schedule-bottom-nav { display: flex; } }
  @media (prefers-reduced-motion: reduce) { .nav-circle-button { transition: none; } }
`;

export default function ScheduleBottomNav({ days, activeDay, onDayClick }: ScheduleBottomNavProps) {
  return (
    <>
      <style>{NAV_CSS}</style>
      <nav className="schedule-bottom-nav" aria-label="เลือกวันเรียน">
        <div className="nav-day-list">
          {days.map((day) => (
            <button
              type="button"
              className={`nav-circle-button ${activeDay === day.id ? "active" : ""}`}
              key={day.id}
              onClick={() => onDayClick(day.id)}
              aria-label={`ไปที่ ${day.id}`}
              aria-current={activeDay === day.id ? "page" : undefined}
            >
              {day.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
