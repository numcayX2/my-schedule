"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ExamDay {
  date: number;
  start: string; // "13:00"
  end: string; // "16:00"
  course: string;
  abbr: string; // Course abbreviation for the badge
}

// ─── Exam Data ───────────────────────────────────────────────────────────────
const EXAM_DAYS: ExamDay[] = [
  { date: 24, start: "13:00", end: "16:00", course: "Data Science Exam", abbr: "DSC" },
  { date: 25, start: "12:00", end: "15:00", course: "AI Exam", abbr: "AIE" },
  { date: 27, start: "15:00", end: "18:00", course: "Digital Exam", abbr: "DIG" },
  { date: 28, start: "15:30", end: "18:30", course: "Science for Life Exam", abbr: "SCI" },
  { date: 29, start: "12:00", end: "15:00", course: "English Exam", abbr: "ENG" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; }

  .exam-section {
    max-width: 1400px;
    margin: 40px auto 0;
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 32px 28px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
    color: #e0e0e0;
    font-family: 'Prompt', sans-serif;
    position: relative;
    overflow: hidden;
    touch-action: pan-y; /* Allow vertical scroll but capture horizontal swipe */
  }

  /* Decorative background grid */
  .exam-section::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .exam-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 32px;
    position: relative;
    z-index: 2;
  }

  .exam-eyebrow {
    color: #ff5c00;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .exam-eyebrow::before {
    content: "";
    width: 24px;
    height: 2px;
    background: #ff5c00;
    display: inline-block;
    box-shadow: 0 0 8px #ff5c00;
  }

  .exam-title {
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
    line-height: 1;
  }

  .exam-title span { color: #ff5c00; }

  .exam-subtitle {
    color: #808080;
    font-size: 14px;
    margin-top: 8px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .exam-nav {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0,0,0,0.3);
    padding: 8px;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .nav-arrow {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .nav-arrow:disabled {
    color: #444;
    border-color: rgba(255,255,255,0.02);
    background: transparent;
    cursor: default;
    opacity: 0.5;
  }

  .nav-arrow:not(:disabled):hover {
    background: rgba(255, 92, 0, 0.1);
    border-color: #ff5c00;
    color: #ff5c00;
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 92, 0, 0.2);
  }

  .nav-date-wrapper {
    min-width: 110px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .nav-date {
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .today-badge {
    font-size: 9px;
    font-weight: 900;
    background: #ff5c00;
    color: #000;
    padding: 2px 6px;
    border-radius: 2px;
    letter-spacing: 0.1em;
  }

  .exam-congrats {
    text-align: center;
    padding: 80px 20px;
    color: #fff;
    position: relative;
    z-index: 2;
  }

  .exam-congrats h2 {
    font-size: 48px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }

  .exam-congrats h2 span { color: #ff5c00; }
  .exam-congrats p { color: #aaa; font-size: 18px; letter-spacing: 0.05em; }

  .exam-timeline {
    margin-top: 24px;
    position: relative;
    z-index: 2;
  }

  .timeline-container {
    position: relative;
    height: 50vh;
    max-height: 480px;
    min-height: 380px;
    margin: 0 20px;
  }

  /* Base Line */
  .timeline-base-line {
    position: absolute;
    left: 120px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
    border-radius: 2px;
  }

  /* Progress Line */
  .timeline-progress-line {
    position: absolute;
    left: 119px; /* Center over base line */
    top: 0;
    width: 4px;
    background: linear-gradient(to bottom, #ff5c00, #ff8c00);
    box-shadow: 0 0 12px #ff5c00, 0 0 24px rgba(255, 92, 0, 0.4);
    border-radius: 2px;
    z-index: 1;
    transform-origin: top center;
  }

  .timeline-milestone {
    position: absolute;
    left: 120px;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #09090b;
    border: 2px solid #555;
    z-index: 3;
  }

  .timeline-milestone.highlight {
    width: 16px;
    height: 16px;
    background: #ff5c00;
    border-color: #fff;
    box-shadow: 0 0 0 4px rgba(255, 92, 0, 0.15), 0 0 20px rgba(255, 92, 0, 0.6);
    animation: pulse-glow 2s infinite;
  }

  @keyframes pulse-glow {
    0% { box-shadow: 0 0 0 4px rgba(255, 92, 0, 0.15), 0 0 20px rgba(255, 92, 0, 0.6); }
    50% { box-shadow: 0 0 0 8px rgba(255, 92, 0, 0.05), 0 0 30px rgba(255, 92, 0, 0.8); }
    100% { box-shadow: 0 0 0 4px rgba(255, 92, 0, 0.15), 0 0 20px rgba(255, 92, 0, 0.6); }
  }

  /* Tick marks connecting dots to labels (now pointing left) */
  .timeline-milestone::after {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    width: 24px;
    height: 1px;
    background: #333;
    transform: translateY(-50%);
    z-index: 1;
    margin-right: 4px;
  }

  .timeline-label {
    position: absolute;
    left: 92px; /* line(120px) - tick(24px) - gap(4px) */
    top: 0;
    transform: translate(-100%, -50%); /* Anchor right edge towards the line */
    font-size: 12px;
    font-weight: 700;
    color: #ccc;
    background: rgba(10, 10, 12, 0.8);
    backdrop-filter: blur(4px);
    padding: 4px 8px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    z-index: 4;
    white-space: nowrap;
    letter-spacing: 0.05em;
    text-align: right;
  }

  .timeline-exam-box {
    position: absolute;
    left: 140px; /* line(120px) + gap(20px) */
    right: 0;
    background: linear-gradient(90deg, rgba(255, 92, 0, 0.12), rgba(255, 92, 0, 0.02));
    border: 1px solid rgba(255, 92, 0, 0.3);
    border-left: 4px solid #ff5c00;
    border-radius: 6px;
    display: flex;
    align-items: center;
    padding: 12px 20px;
    z-index: 2;
    box-shadow: inset 0 0 30px rgba(255, 92, 0, 0.05), 0 8px 20px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  .exam-box-abbr {
    font-size: 11px;
    font-weight: 900;
    color: #ff5c00;
    border: 1px solid rgba(255, 92, 0, 0.4);
    padding: 4px 8px;
    border-radius: 4px;
    margin-right: 16px;
    letter-spacing: 0.1em;
    flex-shrink: 0;
  }

  .timeline-exam-name {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    .exam-section {
      padding: 24px 16px;
      margin: 24px 12px 0;
    }

    .exam-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
    }

    .exam-nav {
      width: 100%;
      justify-content: space-between;
    }

    .nav-date-wrapper {
      min-width: auto;
      flex-grow: 1;
    }

    .exam-title { font-size: 24px; }
    .nav-arrow { width: 44px; height: 44px; font-size: 22px; }

    .timeline-container {
      height: 45vh;
      min-height: 320px;
      margin: 0 12px;
    }

    /* Shift line slightly left on mobile to save space */
    .timeline-base-line, .timeline-milestone { left: 90px; }
    .timeline-progress-line { left: 89px; }
    
    .timeline-milestone::after {
      width: 16px;
    }

    .timeline-label {
      left: 70px; /* line(90px) - tick(16px) - gap(4px) */
      font-size: 11px;
      padding: 3px 6px;
    }

    .timeline-exam-box {
      left: 110px; /* line(90px) + gap(20px) */
      padding: 8px 12px;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 4px;
    }

    .exam-box-abbr {
      margin-right: 0;
      font-size: 9px;
      padding: 2px 6px;
    }

    .timeline-exam-name {
      font-size: 13px;
    }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExamStatusSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCongrats, setIsCongrats] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isToday, setIsToday] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // Determine current date and auto-select initial exam day
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-based
    const day = now.getDate();

    if (month === 8 && day >= 30 && day <= 31) {
      setIsCongrats(true);
      return;
    }

    if (month < 8 || (month === 8 && day < 24)) {
      setSelectedIndex(0);
    } else if (month === 8 && day >= 24 && day <= 29) {
      // Find the next exam day that is >= current date (skip 26)
      const nextExamIndex = EXAM_DAYS.findIndex((exam) => exam.date >= day);
      if (nextExamIndex !== -1) {
        setSelectedIndex(nextExamIndex);
      } else {
        setSelectedIndex(EXAM_DAYS.length - 1);
      }
    } else {
      // After September 1, default to first exam
      setSelectedIndex(0);
    }
  }, []);

  const selectedExam = EXAM_DAYS[selectedIndex];

  // Timeline calculations and Progress logic
  const timelineData = useMemo(() => {
    if (!selectedExam) return null;

    const startMin = timeToMinutes(selectedExam.start);
    const endMin = timeToMinutes(selectedExam.end);

    const beforeMin = startMin - 60;
    const afterMin = endMin + 60;
    const totalSpan = afterMin - beforeMin;

    const milestones = [
      { time: beforeMin, highlight: false },
      { time: startMin, highlight: true },
      { time: startMin + 60, highlight: false },
      { time: startMin + 120, highlight: false },
      { time: endMin, highlight: true },
      { time: afterMin, highlight: false },
    ];

    const startPercent = ((startMin - beforeMin) / totalSpan) * 100;
    const endPercent = ((endMin - beforeMin) / totalSpan) * 100;

    return {
      milestones,
      startPercent,
      endPercent,
      totalSpan,
      beforeMin,
    };
  }, [selectedExam]);

  // Update progress line and "today" status
  useEffect(() => {
    if (!selectedExam || !timelineData) return;

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    
    const checkIsToday = currentMonth === 8 && currentDay === selectedExam.date;
    setIsToday(checkIsToday);

    if (checkIsToday) {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      if (currentMin <= timelineData.beforeMin) {
        setProgressPercent(0);
      } else if (currentMin >= timelineData.beforeMin + timelineData.totalSpan) {
        setProgressPercent(100);
      } else {
        const percent = ((currentMin - timelineData.beforeMin) / timelineData.totalSpan) * 100;
        setProgressPercent(percent);
      }
    } else {
      // If past date, fill 100%. If future date, fill 0%.
      if (currentMonth === 8 && currentDay > selectedExam.date) {
        setProgressPercent(100);
      } else if (currentMonth === 8 && currentDay < selectedExam.date) {
        setProgressPercent(0);
      } else if (currentMonth > 8 || (currentMonth < 8)) {
         // Fallback for out of month bounds
         setProgressPercent(0);
      }
    }
  }, [selectedExam, selectedIndex, timelineData]);

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < EXAM_DAYS.length - 1;

  const handlePrev = () => {
    if (canPrev) setSelectedIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (canNext) setSelectedIndex((prev) => prev + 1);
  };

  // Mobile horizontal swipe logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && canNext) handleNext();
      else if (diff < 0 && canPrev) handlePrev();
    }
  };

  // GSAP Coordinated Timeline Animation
  useLayoutEffect(() => {
    if (!timelineRef.current || isCongrats || !timelineData) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Animate Exam Box
      tl.fromTo(".timeline-exam-box", 
        { opacity: 0, x: -30, scaleY: 0.8, transformOrigin: "left center" },
        { opacity: 1, x: 0, scaleY: 1, duration: 0.6, ease: "power4.out" }, 
        0
      );

      // Animate Progress Line
      tl.fromTo(".timeline-progress-line", 
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: progressPercent / 100, duration: 0.6, ease: "power4.out" }, 
        0
      );

      // Animate Milestones
      tl.fromTo(".timeline-milestone", 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power4.out" }, 
        0.1
      );

      // Animate Labels (Explicit xPercent/yPercent to maintain CSS anchor positioning)
      tl.fromTo(".timeline-label", 
        { x: -20, opacity: 0, xPercent: -100, yPercent: -50 }, 
        { x: 0, opacity: 1, xPercent: -100, yPercent: -50, duration: 0.4, stagger: 0.08, ease: "power4.out" }, 
        0.1
      );

      // Animate Date Text in header
      tl.fromTo(".nav-date-wrapper", 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power4.out" }, 
        0
      );
    }, timelineRef);

    return () => ctx.revert();
  }, [selectedIndex, isCongrats, timelineData, progressPercent]);

  return (
    <section 
      className="exam-section"
      aria-label="Exam Schedule and Status"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{CSS}</style>

      {isCongrats ? (
        <div className="exam-congrats">
          <h2>
            Congratulations<span>.</span>
          </h2>
          <p>Mid-term exams completed. Discipline pays off.</p>
        </div>
      ) : (
        <>
          <div className="exam-header">
            <div>
              <div className="exam-eyebrow">Exam Schedule</div>
              <h2 className="exam-title">
                August 24–29<span>.</span>
              </h2>
              <p className="exam-subtitle">Mid-term Examinations — 2569/1</p>
            </div>

            <div className="exam-nav">
              <button
                className="nav-arrow"
                onClick={handlePrev}
                disabled={!canPrev}
                aria-label="Previous exam day"
                aria-disabled={!canPrev}
              >
                ‹
              </button>
              
              <div className="nav-date-wrapper" aria-live="polite">
                <span className="nav-date">
                  {selectedExam ? `${selectedExam.date} Aug` : ""}
                  {isToday && <span className="today-badge">TODAY</span>}
                </span>
              </div>

              <button
                className="nav-arrow"
                onClick={handleNext}
                disabled={!canNext}
                aria-label="Next exam day"
                aria-disabled={!canNext}
              >
                ›
              </button>
            </div>
          </div>

          {selectedExam && timelineData && (
            <div 
              className="exam-timeline" 
              ref={timelineRef}
              role="region" 
              aria-label={`Timeline for August ${selectedExam.date}`}
            >
              <div className="timeline-container">
                {/* Base Line */}
                <div className="timeline-base-line"></div>
                
                {/* Dynamic Progress Line */}
                <div 
                  className="timeline-progress-line" 
                  style={{ height: `${progressPercent}%` }}
                ></div>

                {/* Exam Box (Rendered first so dots overlap it cleanly) */}
                <div
                  className="timeline-exam-box"
                  style={{
                    top: `${timelineData.startPercent}%`,
                    height: `${timelineData.endPercent - timelineData.startPercent}%`,
                  }}
                >
                  <span className="exam-box-abbr">{selectedExam.abbr}</span>
                  <span className="timeline-exam-name">
                    {selectedExam.course}
                  </span>
                </div>

                {/* Milestones */}
                {timelineData.milestones.map((milestone, idx) => {
                  const percent =
                    ((milestone.time - timelineData.beforeMin) / timelineData.totalSpan) * 100;
                  
                  return (
                    <React.Fragment key={idx}>
                      <div
                        className={`timeline-milestone ${milestone.highlight ? "highlight" : ""}`}
                        style={{ top: `${percent}%` }}
                        aria-hidden="true"
                      />
                      <div
                        className="timeline-label"
                        style={{ top: `${percent}%` }}
                      >
                        {formatTime(milestone.time)}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}