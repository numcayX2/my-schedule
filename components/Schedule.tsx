"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ScheduleBottomNav from "./ScheduleBottomNav";
import ExamStatusSection from "./ExamStatusSection";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassCardProps {
  name: string;
  code: string;
  detail: string;
  row: number;
  colStart: number;
  colEnd: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const DAY_IDS = ["mon", "tue", "wed", "thu", "fri"];

const TIMES = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
];

const CLASSES: ClassCardProps[] = [
  // Monday (row 2)
  {
    name: "วิทยาการข้อมูล",
    code: "10301351",
    detail: "Sec 2 | บรรยาย คอม 6 | 105",
    row: 2,
    colStart: 3,
    colEnd: 5,
  },
  {
    name: "ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ",
    code: "10301364",
    detail: "Sec 1 | Lab คอม 2 | 105",
    row: 2,
    colStart: 6,
    colEnd: 8,
  },
  {
    name: "ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ",
    code: "10700320",
    detail: "Sec 2 | 80-501 | 147",
    row: 2,
    colStart: 8,
    colEnd: 10,
  },

  // Tuesday (row 3)
  {
    name: "ปัญญาประดิษฐ์",
    code: "10301371",
    detail: "Sec 1 | 3203 | 141",
    row: 3,
    colStart: 3,
    colEnd: 5,
  },
  {
    name: "วิทยาการข้อมูล",
    code: "10301351",
    detail: "Sec 2 | Lab คอม 2 | 105",
    row: 3,
    colStart: 6,
    colEnd: 9,
  },
  {
    name: "วิทยาศาสตร์เพื่อชีวิต",
    code: "10300411",
    detail: "Sec 5 | 3102 | 141",
    row: 3,
    colStart: 10,
    colEnd: 12,
  },

  // Thursday (row 5)
  {
    name: "ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ",
    code: "10301364",
    detail: "Sec 1 | Lab คอม 2 | 105",
    row: 5,
    colStart: 2,
    colEnd: 5,
  },
  {
    name: "การประมวลผลภาษาธรรมชาติ",
    code: "10301374",
    detail: "Sec 1 | บรรยาย คอม 8 | 105",
    row: 5,
    colStart: 6,
    colEnd: 8,
  },
  {
    name: "ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ",
    code: "10700320",
    detail: "Sec 2 | 80-501 | 147",
    row: 5,
    colStart: 8,
    colEnd: 10,
  },

  // Friday (row 6)
  {
    name: "การประมวลผลภาษาธรรมชาติ",
    code: "10301374",
    detail: "Sec 1 | Lab คอม 2 | 105",
    row: 6,
    colStart: 2,
    colEnd: 5,
  },
  {
    name: "ปัญญาประดิษฐ์",
    code: "10301371",
    detail: "Sec 1 | Lab คอม 2 | 105",
    row: 6,
    colStart: 6,
    colEnd: 9,
  },
  {
    name: "วิทยาศาสตร์เพื่อชีวิต",
    code: "10300411",
    detail: "Sec 5 | 3102 | 141",
    row: 6,
    colStart: 10,
    colEnd: 12,
  },
];

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700;900&display=swap');

  body {
    margin: 0;
    background: #090909;
  }

  .schedule-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at 15% 10%, rgba(255, 92, 0, 0.08), transparent 38%),
      radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.04), transparent 32%),
      #090909;
    color: #e0e0e0;
    padding: 20px;
    font-family: 'Prompt', sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
  }

  .schedule-root::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    opacity: 0.35;
    background: repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.025) 0px,
      rgba(255,255,255,0.025) 1px,
      transparent 1px,
      transparent 3px
    );
  }

  /* ── Header ── */
  .schedule-header {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    max-width: 1400px;
    margin: 0 auto 32px;
    padding: 28px 24px;
    background: #121212;
    border-bottom: 3px solid #ff5c00;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .schedule-header::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop') center 30% / cover no-repeat;
    filter: grayscale(100%) contrast(1.35) brightness(0.65);
    opacity: 0.55;
  }

  .schedule-header::after {
    content: "";
    position: absolute;
    right: -20px;
    top: -20px;
    width: 140px;
    height: 140px;
    background: #ff5c00;
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.25;
    z-index: -1;
  }

  .schedule-header > * {
    position: relative;
    z-index: 2;
  }

  .schedule-eyebrow {
    color: #ff5c00;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .schedule-eyebrow-line {
    display: inline-block;
    width: 16px;
    height: 2px;
    background: #ff5c00;
  }

  .schedule-title {
    font-size: clamp(30px, 6vw, 52px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    color: #fff;
    margin: 0;
    line-height: 1;
    text-shadow: 3px 3px 0 rgba(255, 92, 0, 0.35);
  }

  .schedule-title span {
    color: #ff5c00;
  }

  .schedule-subtitle {
    margin: 12px 0 0;
    color: #a0a0a0;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    max-width: 480px;
  }

  .schedule-badge-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .schedule-badge-label {
    font-size: 10px;
    color: #666;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .schedule-badge {
    background: #e0e0e0;
    color: #090909;
    font-weight: 900;
    font-size: 14px;
    padding: 4px 12px;
    transform: skewX(-10deg);
  }

  .schedule-badge-inner {
    transform: skewX(10deg);
  }

  /* ── Grid Layout ── */
  .schedule-main {
    max-width: 1400px;
    margin: 0 auto;
    overflow-x: auto;
    padding-bottom: 32px;
    -webkit-overflow-scrolling: touch;
  }

  .schedule-main::-webkit-scrollbar {
    height: 6px;
  }

  .schedule-main::-webkit-scrollbar-thumb {
    background: #333;
  }

  .schedule-main::-webkit-scrollbar-track {
    background: #111;
  }

  .schedule-grid-wrap {
    min-width: 1080px;
    background: #121212;
    border: 1px solid #222;
    box-shadow: 8px 8px 0px 0px rgba(255, 92, 0, 0.05);
  }

  .schedule-grid {
    display: grid;
    grid-template-columns: 72px repeat(10, minmax(90px, 1fr));
    gap: 1px;
    background: #222;
  }

  .schedule-corner {
    background: #121212;
    padding: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    border-bottom: 2px solid #ff5c00;
    border-right: 1px solid #222;
    position: sticky;
    left: 0;
    z-index: 30;
  }

  .schedule-corner span {
    font-size: 9px;
    color: #666;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .schedule-time-header {
    background: #121212;
    padding: 12px 6px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-bottom: 2px solid #2a2a2a;
  }

  .schedule-time-header span {
    color: #a0a0a0;
    font-size: clamp(10px, 1.1vw, 12px);
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .schedule-day {
    background: #181818;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 6px;
    position: sticky;
    left: 0;
    z-index: 20;
    border-right: 1px solid #222;
  }

  .schedule-day-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #333;
    transition: background 0.2s;
  }

  .schedule-day:hover .schedule-day-accent {
    background: #ff5c00;
  }

  .schedule-cell {
    background: #0f0f0f;
    position: relative;
    min-height: 56px;
  }

  .schedule-cell-dot {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 2px;
    height: 2px;
    background: #1f1f1f;
  }

  /* ── Class Cards ── */
  .class-card {
    background: #181818;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 16px;
    transition: background 0.3s;
    cursor: crosshair;
    z-index: 10;
    will-change: transform, opacity;
  }

  .class-card:hover {
    background: #202020;
  }

  .class-card-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #ff5c00;
    transition: width 0.3s;
  }

  .class-card:hover .class-card-accent {
    width: 6px;
  }

  .class-card-body {
    padding-left: 8px;
  }

  .class-card-code {
    display: block;
    color: #ff5c00;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }

  .class-card-name {
    font-size: 14px;
    font-weight: 700;
    color: #e0e0e0;
    line-height: 1.3;
    margin: 0 0 8px;
    padding-right: 8px;
  }

  .class-card-detail {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .class-card-dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #333;
  }

  /* ── Mobile List Layout ── */
  .schedule-mobile-list {
    display: none;
    max-width: 640px;
    margin: 0 auto;
  }

  .mobile-day {
    background: #121212;
    border: 1px solid #2a2a2a;
    border-left: 4px solid #ff5c00;
    overflow: hidden;
  }

  .mobile-day-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #181818;
    border-bottom: 1px solid #222;
  }

  .mobile-day-title {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }

  .mobile-day-title::before {
    content: "";
    width: 8px;
    height: 8px;
    background: #ff5c00;
    transform: skewX(-10deg);
  }

  .mobile-day-count {
    margin-left: auto;
    font-size: 12px;
    color: #888;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .mobile-class {
    background: #0f0f0f;
    padding: 16px;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #222;
  }

  .mobile-class:last-child {
    border-bottom: none;
  }

  .mobile-class-code {
    color: #ff5c00;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.1em;
  }

  .mobile-class-name {
    font-size: 15px;
    font-weight: 700;
    color: #e0e0e0;
    line-height: 1.4;
    margin: 4px 0 6px;
  }

  .mobile-class-detail {
    font-size: 11px;
    color: #666;
    font-weight: 500;
    letter-spacing: 0.03em;
  }

  .mobile-class-time {
    font-size: 14px;
    font-weight: 900;
    color: #ff5c00;
    white-space: nowrap;
  }

  .mobile-day-empty {
    padding: 20px 16px;
    text-align: center;
    color: #555;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .schedule-root {
      padding: 12px;
      padding-bottom: 90px; /* make room for floating nav */
    }

    .schedule-header {
      padding: 20px 16px;
      margin-bottom: 20px;
      align-items: flex-start;
      flex-direction: column;
    }

    .schedule-title {
      font-size: 28px;
    }

    .schedule-subtitle {
      font-size: 12px;
    }

    .schedule-badge-label {
      display: none;
    }

    .schedule-badge {
      font-size: 12px;
      padding: 3px 8px;
    }

    .schedule-grid-layout {
      display: none;
    }

    .schedule-mobile-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .schedule-grid-wrap {
      min-width: 840px;
    }

    .schedule-grid {
      grid-template-columns: 60px repeat(10, minmax(76px, 1fr));
    }

    .schedule-corner,
    .schedule-time-header {
      padding: 8px 4px;
    }

    .schedule-day {
      font-size: 12px;
      padding: 8px 4px;
    }

    .class-card {
      padding: 10px 12px;
    }

    .class-card-code {
      font-size: 10px;
    }

    .class-card-name {
      font-size: 12px;
    }

    .class-card-detail {
      font-size: 10px;
    }
  }

  @media (max-width: 380px) {
    .schedule-title {
      font-size: 24px;
    }

    .schedule-grid-wrap {
      min-width: 800px;
    }

    .schedule-grid {
      grid-template-columns: 56px repeat(10, minmax(72px, 1fr));
    }
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function ClassCard({
  name,
  code,
  detail,
  row,
  colStart,
  colEnd,
}: ClassCardProps) {
  return (
    <div
      className="class-card"
      style={{
        gridRowStart: row,
        gridColumnStart: colStart,
        gridColumnEnd: colEnd,
      }}
    >
      <div className="class-card-accent" />
      <div className="class-card-body">
        <span className="class-card-code">{code}</span>
        <p className="class-card-name">{name}</p>
        <div className="class-card-detail">
          <span className="class-card-dot" />
          {detail}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Schedule() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeDay, setActiveDay] = useState<string>("mon");

  // Inject CSS and run GSAP animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".schedule-header > *",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power4.out", stagger: 0.08 },
      );

      // Grid animations
      gsap.fromTo(
        ".schedule-time-header, .schedule-day, .schedule-corner, .schedule-cell",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power4.out", stagger: 0.012 },
      );

      gsap.fromTo(
        ".class-card",
        { opacity: 0, y: 36, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.05,
          clearProps: "opacity,transform",
        },
      );

      // Mobile list animations
      gsap.fromTo(
        ".mobile-day",
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power4.out", stagger: 0.08 },
      );

      gsap.fromTo(
        ".mobile-class",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power4.out",
          stagger: 0.04,
          clearProps: "opacity,transform",
        },
      );
    }, rootRef);

    return () => {
      document.head.removeChild(style);
      ctx.revert();
    };
  }, []);

  // IntersectionObserver for active day tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveDay(entry.target.id.replace("day-", ""));
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      },
    );

    DAY_IDS.forEach((id) => {
      const el = dayRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll to day
  const scrollToDay = (dayId: string) => {
    const el = dayRefs.current[dayId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveDay(dayId);
    }
  };

  // Build mobile schedule data
  const mobileSchedule = DAYS.map((day, dayIndex) => {
    const row = dayIndex + 2;
    return {
      day,
      dayId: DAY_IDS[dayIndex],
      classes: CLASSES.filter((c) => c.row === row)
        .sort((a, b) => a.colStart - b.colStart)
        .map((c) => ({
          ...c,
          time: `${TIMES[c.colStart - 2].split("-")[0]} - ${
            TIMES[c.colEnd - 3].split("-")[1]
          }`,
        })),
    };
  });

  const navDays = DAY_IDS.map((id, index) => ({
    id,
    label: ["M", "T", "W", "TH", "F"][index],
  }));

  return (
    <div className="schedule-root" ref={rootRef}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <header className="schedule-header">
        <div>
          <div className="schedule-eyebrow">
            <span className="schedule-eyebrow-line" />
            Discipline // Active
          </div>
          <h1 className="schedule-title">
            Schedule<span>.</span>
          </h1>
          <p className="schedule-subtitle">
            Discipline is the bridge between goals and accomplishment.
          </p>
        </div>
        <div className="schedule-badge-wrap">
          <span className="schedule-badge-label">Semester</span>
          <div className="schedule-badge">
            <div className="schedule-badge-inner">2569 / 1</div>
          </div>
        </div>
      </header>

      {/* ── Desktop / Tablet Grid ── */}
      <main className="schedule-main schedule-grid-layout">
        <div className="schedule-grid-wrap">
          <div className="schedule-grid">
            <div className="schedule-corner">
              <span>Day/Time</span>
            </div>

            {TIMES.map((time) => (
              <div key={time} className="schedule-time-header">
                <span>{time}</span>
              </div>
            ))}

            {DAYS.map((day, rowIdx) => (
              <React.Fragment key={day}>
                <div
                  className="schedule-day"
                  style={{ gridRowStart: rowIdx + 2, gridColumnStart: 1 }}
                >
                  <div className="schedule-day-accent" />
                  {day}
                </div>

                {TIMES.map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="schedule-cell"
                    style={{
                      gridRowStart: rowIdx + 2,
                      gridColumnStart: colIdx + 2,
                    }}
                  >
                    <div className="schedule-cell-dot" />
                  </div>
                ))}
              </React.Fragment>
            ))}

            {CLASSES.map((cls) => (
              <ClassCard
                key={`${cls.code}-${cls.row}-${cls.colStart}`}
                {...cls}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ── Mobile List ── */}
      <section
        className="schedule-mobile-list"
        aria-label="Schedule mobile list"
      >
        {mobileSchedule.map((day) => (
          <div
            key={day.day}
            id={`day-${day.dayId}`}
            ref={(el) => {
              dayRefs.current[day.dayId] = el;
            }}
            className="mobile-day"
          >
            <div className="mobile-day-header">
              <h2 className="mobile-day-title">{day.day}</h2>
              <span className="mobile-day-count">
                {day.classes.length > 0
                  ? `${day.classes.length} sessions`
                  : "0 sessions"}
              </span>
            </div>

            {day.classes.length === 0 ? (
              <div className="mobile-day-empty">Rest day — no excuses.</div>
            ) : (
              day.classes.map((cls) => (
                <div
                  className="mobile-class"
                  key={`${cls.code}-${cls.row}-${cls.colStart}`}
                >
                  <div>
                    <span className="mobile-class-code">{cls.code}</span>
                    <h3 className="mobile-class-name">{cls.name}</h3>
                    <p className="mobile-class-detail">{cls.detail}</p>
                  </div>
                  <span className="mobile-class-time">{cls.time}</span>
                </div>
              ))
            )}
          </div>
        ))}
      </section>

      <ExamStatusSection />

      {/* ── Floating Bottom Navigation ── */}
      <ScheduleBottomNav
        days={navDays}
        activeDay={activeDay}
        onDayClick={scrollToDay}
      />
    </div>
  );
}
