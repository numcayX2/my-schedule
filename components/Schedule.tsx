"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Dossier from "./Dossier";
import MobileDays from "./MobileDays";
import NowDeck from "./NowDeck";
import WeekBoard from "./WeekBoard";
import type { TypeFilter } from "./ClassCard";
import { CLOCK_TICK_MS, DECODE } from "./motion-presets";
import { CLASSES } from "./schedule-data";
import { demoDate, durationHours, getNowState, isoWeek, pad2 } from "./schedule-time";
import { DISPLAY_CHARSET, EncryptedText } from "./ui/encrypted-text";

const TERM = "TERM 2/2569";
const COURSES = [...new Map(CLASSES.map((s) => [s.code, s])).values()];
const WEEKDAY = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "ALL", label: "ทั้งหมด" },
  { id: "LEC", label: "LEC บรรยาย" },
  { id: "LAB", label: "LAB ปฏิบัติ" },
];

// Wall clock as an external store. The server snapshot is null, so the server
// HTML shows placeholders and time-dependent output never mismatches on hydrate.
let clockMs: number | null = null;
function subscribeClock(onChange: () => void) {
  const update = () => {
    clockMs = Date.now();
    onChange();
  };
  update();
  const id = window.setInterval(update, CLOCK_TICK_MS);
  return () => window.clearInterval(id);
}
const readClock = () => clockMs;

// "#demo" in the URL starts in DEMO clock mode (used for screenshots and QA).
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readDemoHash = () => window.location.hash.includes("demo");

export default function Schedule() {
  // The clock only exists on the client: server HTML renders placeholders,
  // so time-dependent output never causes a hydration mismatch.
  const tickMs = useSyncExternalStore(subscribeClock, readClock, () => null);
  const isDemo = useSyncExternalStore(subscribeHash, readDemoHash, () => false);
  const [filter, setFilter] = useState<TypeFilter>("ALL");
  const [dossierCode, setDossierCode] = useState<string | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const clock = useMemo(
    () => (tickMs === null ? null : isDemo ? demoDate(new Date(tickMs)) : new Date(tickMs)),
    [tickMs, isDemo],
  );
  const now = useMemo(() => (clock ? getNowState(clock) : null), [clock]);

  const openDossier = useCallback((code: string, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setDossierCode(code);
    setDossierOpen(true);
  }, []);
  const closeDossier = useCallback(() => {
    setDossierOpen(false);
    triggerRef.current?.focus();
  }, []);

  const week = clock ? pad2(isoWeek(clock)) : "00";
  const hours = CLASSES.filter((s) => filter === "ALL" || s.type === filter).reduce((n, s) => n + durationHours(s), 0);

  return (
    <div className="app">
      <div className="ghost" aria-hidden="true">
        WK{week}
      </div>

      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">MY—SCHEDULE</span>
          <span className="stamp">
            FILE{" "}
            <em>
              {clock ? (
                <EncryptedText text={`SCH-${clock.getFullYear()}-W${week}`} {...DECODE.stamp} />
              ) : (
                "SCH-0000-W00"
              )}
            </em>
            {` // ${TERM}`}
          </span>
        </div>
      </div>

      <header className="head">
        <div>
          <div className="eyebrow">
            <b>DATA FILE</b>
            <span className="chev" aria-hidden="true">
              &gt;&gt;
            </span>
            <span className="stamp">WEEKLY TIMETABLE</span>
          </div>
          <h1>
            <EncryptedText text="WEEKLY" charset={DISPLAY_CHARSET} {...DECODE.title} />
            <br />
            <span className="outline">
              <EncryptedText text="SCHEDULE" charset={DISPLAY_CHARSET} {...DECODE.title} />
            </span>
          </h1>
          <p className="th-title">ตารางเรียนประจำสัปดาห์ ภาคการศึกษาที่ 2/2569</p>
          <p className="th-sub">
            {COURSES.length} วิชา · {CLASSES.length} คาบ · จันทร์ถึงศุกร์ 09:00–21:00
          </p>
        </div>
        <div className="clock">
          <div className="clock-date">
            {clock ? `${pad2(clock.getDate())}/${pad2(clock.getMonth() + 1)}` : "--/--"}
            <small>{clock ? WEEKDAY[clock.getDay()] : "---"}</small>
          </div>
          <div className="clock-time">
            {isDemo ? "DEMO" : "LOCAL"} <b>{clock ? `${pad2(clock.getHours())}:${pad2(clock.getMinutes())}` : "--:--"}</b>
          </div>
        </div>
      </header>

      <NowDeck now={now} courses={COURSES} onOpen={openDossier} />

      <main className="main">
        <div className="board-tools">
          <div className="filters trough-group" role="group" aria-label="กรองประเภทคาบ">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="pill"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
          <div className="count">
            <b>{pad2(hours)}</b>HRS / WEEK
          </div>
        </div>
        <WeekBoard now={now} filter={filter} onOpen={openDossier} />
        <MobileDays now={now} filter={filter} onOpen={openDossier} />
      </main>

      <Dossier code={dossierCode} open={dossierOpen} onClose={closeDossier} />
    </div>
  );
}
