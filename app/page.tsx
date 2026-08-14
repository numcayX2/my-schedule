"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

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

// ─── CSS (Hardcore / ZZZ Vibe) ───────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Teko:wght@400;500;700&display=swap');

  :root {
    --bg-color: #050505;
    --text-main: #E0E0E0;
    --accent: #FF4D00;
    --grid-line: #1a1a1a;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 0;
    background: #000;
    overflow-x: hidden;
  }

  .schedule-root {
    position: relative;
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-main);
    font-family: 'Chakra Petch', sans-serif;
    -webkit-font-smoothing: antialiased;
    padding: 16px;
    /* Hardcore Gym B&W Background with Heavy Dark Overlay */
    background-image: linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    overflow: hidden;
  }

  /* Scanline Effect for ZZZ Vibe */
  .schedule-root::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 3px,
      rgba(255, 255, 255, 0.03) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  .schedule-content {
    position: relative;
    z-index: 10;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .schedule-header {
    margin-bottom: 24px;
    border-bottom: 2px solid var(--accent);
    padding-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }
  .header-left { display: flex; flex-direction: column; gap: 4px; }
  
  .schedule-eyebrow {
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2em;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
  }
  .schedule-eyebrow span {
    width: 8px; height: 8px; background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
  }
  .schedule-title {
    font-family: 'Teko', sans-serif;
    font-size: 48px;
    font-weight: 700;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
    line-height: 0.9;
    letter-spacing: -0.02em;
  }
  .schedule-title span { color: var(--accent); }
  
  .schedule-badge {
    background: transparent;
    border: 1px solid var(--accent);
    color: #fff;
    font-size: 12px;
    padding: 6px 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  }

  /* ── Desktop Grid (Hidden on Mobile) ── */
  .desktop-schedule {
    display: none;
    background: rgba(10, 10, 10, 0.8);
    border: 1px solid var(--grid-line);
    backdrop-filter: blur(4px);
  }
  .schedule-grid {
    display: grid;
    grid-template-columns: 80px repeat(10, 1fr);
    gap: 1px;
    background: var(--grid-line);
  }
  .schedule-corner, .schedule-time-header, .schedule-day, .schedule-cell {
    background: #0a0a0a;
  }
  .schedule-corner {
    padding: 12px; display: flex; align-items: flex-end; justify-content: flex-end;
    border-bottom: 2px solid var(--accent);
  }
  .schedule-corner span { font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; }
  .schedule-time-header { padding: 12px; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid #222; }
  .schedule-time-header span { color: #888; font-size: 10px; font-weight: 600; }
  .schedule-day {
    color: #fff; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; padding: 12px;
    border-right: 2px solid transparent;
    transition: border-color 0.2s;
  }
  .schedule-day:hover { border-color: var(--accent); }
  .schedule-cell { position: relative; min-height: 60px; }
  .schedule-cell::after { content: ""; position: absolute; inset: 0; margin: auto; width: 4px; height: 4px; background: #1f1f1f; border-radius: 50%; }

  .class-card-desk {
    background: linear-gradient(90deg, rgba(255,77,0,0.15) 0%, rgba(20,20,20,0.9) 30%);
    position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding: 12px; border-right: 2px solid var(--accent);
    transition: all 0.3s;
  }
  .class-card-desk:hover { background: linear-gradient(90deg, rgba(255,77,0,0.3) 0%, rgba(30,30,30,0.9) 30%); }
  .desk-code { display: block; color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 4px; }
  .desk-name { font-size: 12px; font-weight: 600; color: #fff; line-height: 1.2; margin: 0 0 6px; }
  .desk-detail { font-size: 10px; color: #888; display: flex; align-items: center; gap: 4px; }

  /* ── Mobile List (Visible on Mobile) ── */
  .mobile-schedule {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .day-group {
    border-left: 2px solid var(--accent);
    padding-left: 12px;
    position: relative;
  }
  .day-group::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 0;
    width: 10px;
    height: 10px;
    background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
  }
  .day-title {
    font-family: 'Teko', sans-serif;
    font-size: 32px;
    color: #fff;
    text-transform: uppercase;
    margin: 0 0 12px -14px;
    padding-left: 8px;
    background: linear-gradient(90deg, rgba(255,77,0,0.2) 0%, transparent 100%);
    line-height: 1;
  }
  .day-title span { color: var(--accent); font-size: 16px; margin-right: 8px; vertical-align: middle; }

  .class-card-mobile {
    background: rgba(15, 15, 15, 0.9);
    border: 1px solid #222;
    margin-bottom: 12px;
    position: relative;
    padding: 16px;
    clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
    backdrop-filter: blur(4px);
    transition: transform 0.3s, border-color 0.3s;
  }
  .class-card-mobile:active {
    transform: scale(0.98);
    border-color: var(--accent);
  }
  .mobile-time-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--accent);
    color: #000;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    clip-path: polygon(20% 0, 100% 0, 100% 100%, 0% 100%);
  }
  .mobile-code { color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: 0.1em; display: block; margin-bottom: 8px; }
  .mobile-name { font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 8px; line-height: 1.2; }
  .mobile-detail { font-size: 12px; color: #aaa; border-top: 1px solid #222; padding-top: 8px; display: flex; align-items: center; gap: 6px; }
  .mobile-detail::before { content: "►"; color: var(--accent); font-size: 8px; }

  @media (min-width: 1024px) {
    .desktop-schedule { display: block; }
    .mobile-schedule { display: none; }
    .schedule-root { padding: 40px; }
    .schedule-title { font-size: 64px; }
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function getTimeFromCol(colStart: number, colEnd: number) {
  const startIdx = colStart - 2;
  const endIdx = colEnd - 2;

  const startTime = TIMES[startIdx]?.split("-")[0] || "";
  const endTime = TIMES[endIdx - 1]?.split("-")[1] || "";

  return `${startTime} - ${endTime}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Schedule() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    // GSAP Stiff & Firm Animation
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".schedule-header > *", {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.1,
      });

      // Mobile Cards Animation
      gsap.from(".class-card-mobile", {
        x: -30,
        opacity: 0,
        duration: 0.3,
        ease: "power4.out",
        stagger: 0.05,
        delay: 0.2,
      });

      // Desktop Grid Animation
      gsap.from(".schedule-day, .class-card-desk", {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.out",
        stagger: { each: 0.02, from: "start" },
        delay: 0.2,
      });
    }, rootRef);

    return () => {
      ctx.revert();
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="schedule-root" ref={rootRef}>
      <div className="schedule-content">
        {/* ── Header ── */}
        <header className="schedule-header">
          <div className="header-left">
            <div className="schedule-eyebrow">
              <span></span>
              COMBAT MODE // ACTIVE
            </div>
            <h1 className="schedule-title">
              SCHEDULE<span>.</span>
            </h1>
          </div>
          <div className="schedule-badge">SEMESTER 2569 / 1</div>
        </header>

        {/* ── Desktop Layout (Grid) ── */}
        <main className="desktop-schedule">
          <div className="schedule-grid">
            <div className="schedule-corner">
              <span>DAY/TIME</span>
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
                  />
                ))}
              </React.Fragment>
            ))}

            {CLASSES.map((cls) => (
              <div
                key={`desk-${cls.code}-${cls.row}-${cls.colStart}`}
                className="class-card-desk"
                style={{
                  gridRowStart: cls.row,
                  gridColumnStart: cls.colStart,
                  gridColumnEnd: cls.colEnd,
                }}
              >
                <span className="desk-code">OP_{cls.code}</span>
                <p className="desk-name">{cls.name}</p>
                <div className="desk-detail">{cls.detail}</div>
              </div>
            ))}
          </div>
        </main>

        {/* ── Mobile Layout (Vertical List) ── */}
        <main className="mobile-schedule">
          {DAYS.map((day, dayIdx) => {
            const dayClasses = CLASSES.filter((c) => c.row - 2 === dayIdx).sort(
              (a, b) => a.colStart - b.colStart,
            );
            if (dayClasses.length === 0) return null;

            return (
              <div key={`mob-day-${day}`} className="day-group">
                <h2 className="day-title">
                  <span>►</span>
                  {day}
                </h2>
                {dayClasses.map((cls) => (
                  <div
                    key={`mob-${cls.code}-${cls.row}-${cls.colStart}`}
                    className="class-card-mobile"
                  >
                    <div className="mobile-time-badge">
                      {getTimeFromCol(cls.colStart, cls.colEnd)}
                    </div>
                    <span className="mobile-code">OP_CODE: {cls.code}</span>
                    <h3 className="mobile-name">{cls.name}</h3>
                    <div className="mobile-detail">{cls.detail}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
