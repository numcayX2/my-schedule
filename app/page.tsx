"use client";

import React, { useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassCardProps {
  code: string;
  name: string;
  detail: string;
  row?: number;
  colStart?: number;
  colEnd?: number;
  colorVariation: "orange" | "red" | "blue" | "green" | "purple"; // Added visual distinction
}

// ─── Data Constants ──────────────────────────────────────────────────────

export const TIMES = ["08:30", "12:50"]; // Adjust timing based on schedule needs
const DAYS = [null, null]; // Mon-Fri would normally be 5 rows (index-based)

// ─── Class List Data Structure ──────────────────────────────────────────────

export const CLASSES = [
  {
    class_id: "10300411",
    code: "SFL-2569/1", // Extracted from section + year info if needed
    name: "วิทยาศาสตร์เพื่อชีวิต (Science for Life)",
    detail: `ห้องบรรยายและแลปคอม, อาคาร 141 | Sec.5`,
    row: 3, // Wednesday example placement - adjust based on actual schedule timing
    colStart: 2,
    colEnd: 3,
    colorVariation: "orange" as const,
  },

  {
    class_id: "10301351",
    code: "DS-2569/1", // Data Science course prefix (example)
    name: "วิทยาการข้อมูล (Data Science)",
    detail: `ห้องบรรยายคอม. 6 & Lab คอม. 2, อาคาร 105 | Sec.2`,
    row: 4, // Thursday example placement - adjust based on actual schedule timing  
    colStart: 3,
    colEnd: 5,
    colorVariation: "red" as const,
  },

  {
    class_id: "10301364",
    code: "DL-2569/1", // Digital Logic course prefix (example)  
    name: "ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ (Digital Logic and Smart Device)",
    detail: `Lab คอม. 2, อาคาร 105 | Sec.1`,
    row: 4,
    colStart: 3,
    colEnd: 4,  
    colorVariation: "red" as const, 
  },

  {
    class_id: "10301371",
    code: "AI-2569/1", // Artificial Intelligence course prefix (example)
    name: "ปัญญาประดิษฐ์ (Artificial Intelligence)",  
    detail: `ห้องบรรยายคอม. 8 & Lab คอม. 2, อาคาร 141 | Sec.1`,
    row: 3, // Adjust based on actual schedule timing
    colStart: 6,
    colEnd: 7,
    colorVariation: "red" as const, 
  },

  {
    class_id: "10301374",  
    code: "NLP-2569/1", // Natural Language Processing course prefix (example)
    name: `การประมวลผลภาษาธรรมชาติ (Natural Language Processing)`,
    detail: `ห้องบรรยายคอม. 8 & Lab คอม. 2, อาคาร 105 | Sec.1`,  
    row: 4,
    colStart: 3, 
    colEnd: 6,
    colorVariation: "red" as const,
  },

  {
    class_id: "10700320",
    code: "ENG-2569/1", // English course prefix (example)  
    name: `ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ`,
    detail: `80-501, อาคาร 147 | Sec.2`, 
    row: 3,
    colStart: 4, 
    colEnd: 6,
    colorVariation: "blue" as const,  
  },
];

// ─── CSS (no Tailwind dependency) ────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700;900&display=swap');

  body {
    margin: 0;
    padding: 0;
  }

  .schedule-root {
    min-height: 100vh;
    background: #090909;
    color: #e0e0e0;
    padding: 20px;
    font-family: 'Prompt', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Header ── */
  .schedule-header {
    max-width: 1400px;
    margin: 0 auto 32px;
    padding-bottom: 16px;
    border-bottom: 2px solid #222;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
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
    font-size: 36px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0;
  }
  .schedule-title span { color: #ff5c00; }
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
  .schedule-badge-inner { transform: skewX(10deg); }

  /* ── Grid Container ── */
  .schedule-main {
    max-width: 1400px;
    margin: 0 auto;
    overflow-x: auto;
    padding-bottom: 32px;
  }
  .schedule-grid-wrap {
    min-width: 1100px;
    background: #121212;
    border: 1px solid #222;
    box-shadow: 8px 8px 0px 0px rgba(255, 92, 0, 0.05);
  }
  .schedule-grid {
    display: grid;
    grid-template-columns: 80px repeat(10, 1fr);
    gap: 1px;
    background: #222;
  }

  /* ── Corner & Time Headers ── */
  .schedule-corner {
    background: #121212;
    padding: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    border-bottom: 2px solid #ff5c00;
    position: sticky;
    left: 0;
    z-index: 30;  /* สูงกว่า day column */
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
    padding: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-bottom: 2px solid #2a2a2a;
  }
  .schedule-time-header span {
    color: #a0a0a0;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  /* ── Day Labels ── */
  .schedule-day {
    background: #181818;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    position: sticky;
    left: 0;
    z-index: 20;
  }
  .schedule-day-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: #333;
    transition: background 0.2s;
  }
  .schedule-day:hover .schedule-day-accent { background: #ff5c00; }

  /* ── Empty Cells ── */
  .schedule-cell {
    background: #0f0f0f;
    position: relative;
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
  }
  .class-card:hover { background: #202020; }
  .class-card-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: #ff5c00;
    transition: width 0.3s;
  }
  .class-card:hover .class-card-accent { width: 6px; }
  .class-card-body { padding-left: 8px; }
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
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function ClassCard({
  name,
  code,
  detail,  
}: Omit<ClassCardProps, 'colorVariation'>) { 
  return ( // Updated to accept only core required props while keeping optional grid positioning via className/inline style in JSX
    <div className="class-card">
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
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="schedule-root">
      {/* ── Header ── */}
      <header className="schedule-header">
        <div>
          <div className="schedule-eyebrow">
            <span className="schedule-eyebrow-line" />
            Network_Sync // Active
          </div>
          <h1 className="schedule-title">
            Schedule<span>.</span>
          </h1>
        </div>
        <div className="schedule-badge-wrap">
          <span className="schedule-badge-label">Semester</span>
          <div className="schedule-badge">
            <div className="schedule-badge-inner">2569 / 1</div>
          </div>
        </div>
      </header>

      {/* ── Grid ── */}
      <main className="schedule-main">
        <div className="schedule-grid-wrap">
          <div className="schedule-grid">
            {/* Corner */}
            <div className="schedule-corner">
              <span>Day/Time</span>
            </div>

            {/* Time Headers */}
            {TIMES.map((time) => (
              <div key={time} className="schedule-time-header">
                <span>{time}</span>
              </div>
            ))}

            {/* Day Rows + Empty Cells */}
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

            {/* Class Cards */}
            {CLASSES.map((cls) => (
              <ClassCard
                key={`${cls.code}-${cls.row}-${cls.colStart}`}
                {...cls}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
