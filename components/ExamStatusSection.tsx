"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ExamDay {
  date: number;
  start: string;
  end: string;
  course: string;
  abbr: string;
}

// ─── Exam Data ───────────────────────────────────────────────────────────────
const EXAM_DAYS: ExamDay[] = [
  {
    date: 24,
    start: "13:00",
    end: "16:00",
    course: "Data Science Exam",
    abbr: "DSC",
  },
  { date: 25, start: "12:00", end: "15:00", course: "AI Exam", abbr: "AIE" },
  {
    date: 27,
    start: "15:00",
    end: "18:00",
    course: "Digital Exam",
    abbr: "DIG",
  },
  {
    date: 28,
    start: "15:30",
    end: "18:30",
    course: "Science for Life Exam",
    abbr: "SCI",
  },
  {
    date: 29,
    start: "12:00",
    end: "15:00",
    course: "English Exam",
    abbr: "ENG",
  },
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
  .exam-section {
    max-width: 1400px;
    margin: 40px auto 0;
    background: #0D0E0F;
    border: 2px solid #FFFFFF;
    color: #e0e0e0;
    font-family: 'Prompt', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Hide native cursor to let global ink cursor take over */
  @media (hover: hover) and (pointer: fine) {
    .exam-section * {
      cursor: none !important;
    }
  }

  .exam-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 24px;
    border-bottom: 2px solid #FFFFFF;
    position: relative;
  }

  .exam-header::before {
    content: "";
    position: absolute;
    left: 0; bottom: -2px;
    width: 120px; height: 2px;
    background: #9FE826;
  }

  .exam-eyebrow {
    color: #9FE826;
    font-size: 12px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .exam-title {
    font-size: 36px;
    font-weight: 900;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .exam-title span { color: #9FE826; }

  .exam-subtitle {
    color: #888;
    font-size: 13px;
    margin-top: 8px;
    font-family: 'JetBrains Mono', monospace;
  }

  .exam-nav {
    display: flex;
    align-items: stretch;
    border: 2px solid #FFFFFF;
  }

  .nav-arrow {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0D0E0F;
    color: #fff;
    font-size: 24px;
    border: none;
    transition: background 0.1s, color 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-arrow:not(:disabled):hover {
    background: #9FE826;
    color: #0D0E0F;
  }
  .nav-arrow:disabled {
    color: #333;
    opacity: 0.5;
  }
  .nav-arrow:first-child { border-right: 2px solid #FFFFFF; }
  .nav-arrow:last-child { border-left: 2px solid #FFFFFF; }

  .nav-date-wrapper {
    min-width: 140px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
  }

  .nav-date {
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
  }

  .today-badge {
    font-size: 9px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    background: #9FE826;
    color: #0D0E0F;
    padding: 2px 6px;
    letter-spacing: 0.1em;
  }

  .exam-congrats {
    text-align: center;
    padding: 80px 20px;
    color: #fff;
  }
  .exam-congrats h2 {
    font-size: 48px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }
  .exam-congrats h2 span { color: #9FE826; }
  .exam-congrats p { color: #aaa; font-size: 16px; font-family: 'JetBrains Mono', monospace; }

  .exam-timeline {
    padding: 32px 24px;
    position: relative;
  }

  .timeline-container {
    position: relative;
    height: 50vh;
    max-height: 480px;
    min-height: 380px;
    margin: 0 20px;
  }

  .timeline-base-line {
    position: absolute;
    left: 120px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #FFFFFF;
  }

  .timeline-progress-line {
    position: absolute;
    left: 119px;
    top: 0;
    width: 4px;
    background: #9FE826;
    z-index: 1;
    transform-origin: top center;
  }

  .timeline-milestone {
    position: absolute;
    left: 120px;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: #0D0E0F;
    border: 2px solid #FFFFFF;
    z-index: 3;
  }

  .timeline-milestone.highlight {
    width: 18px;
    height: 18px;
    background: #9FE826;
    border-color: #FFFFFF;
    animation: pulse-brutalist 1.5s infinite;
  }

  @keyframes pulse-brutalist {
    0% { box-shadow: 0 0 0 0 rgba(159, 232, 38, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(159, 232, 38, 0); }
    100% { box-shadow: 0 0 0 0 rgba(159, 232, 38, 0); }
  }

  .timeline-milestone::after {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    width: 24px;
    height: 2px;
    background: #333;
    transform: translateY(-50%);
    z-index: 1;
    margin-right: 4px;
  }

  .timeline-label {
    position: absolute;
    left: 92px;
    top: 0;
    transform: translate(-100%, -50%);
    font-size: 12px;
    font-weight: 700;
    color: #9FE826;
    background: #0D0E0F;
    border: 1px solid #333;
    padding: 4px 8px;
    z-index: 4;
    white-space: nowrap;
    letter-spacing: 0.05em;
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
  }

  .timeline-exam-box {
    position: absolute;
    left: 140px;
    right: 0;
    background: #0D0E0F;
    border: 2px solid #9FE826;
    border-left: 8px solid #9FE826;
    display: flex;
    align-items: center;
    padding: 12px 20px;
    z-index: 2;
    overflow: hidden;
    transition: background 0.2s, color 0.2s;
  }
  .timeline-exam-box:hover {
    background: #9FE826;
    color: #0D0E0F !important;
  }
  .timeline-exam-box:hover .exam-box-abbr,
  .timeline-exam-box:hover .timeline-exam-name {
    color: #0D0E0F;
    border-color: #0D0E0F;
  }

  .exam-box-abbr {
    font-size: 11px;
    font-weight: 700;
    color: #9FE826;
    border: 1px solid #9FE826;
    padding: 4px 8px;
    margin-right: 16px;
    letter-spacing: 0.1em;
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
    transition: color 0.2s, border-color 0.2s;
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
    transition: color 0.2s;
  }

  @media (max-width: 768px) {
    .exam-section {
      margin: 24px 12px 0;
    }
    .exam-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
      padding: 16px;
    }
    .exam-nav {
      width: 100%;
      justify-content: space-between;
    }
    .nav-date-wrapper {
      min-width: auto;
      flex-grow: 1;
    }
    .exam-title { font-size: 28px; }

    .timeline-container {
      height: 45vh;
      min-height: 320px;
      margin: 0 12px;
    }

    .timeline-base-line, .timeline-milestone { left: 90px; }
    .timeline-progress-line { left: 89px; }
    .timeline-milestone::after { width: 16px; }
    .timeline-label {
      left: 70px;
      font-size: 11px;
      padding: 3px 6px;
    }

    .timeline-exam-box {
      left: 110px;
      padding: 8px 12px;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .exam-box-abbr {
      margin-right: 0;
      font-size: 9px;
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

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if (month === 8 && day >= 30 && day <= 31) {
      setIsCongrats(true);
      return;
    }

    if (month < 8 || (month === 8 && day < 24)) {
      setSelectedIndex(0);
    } else if (month === 8 && day >= 24 && day <= 29) {
      const nextExamIndex = EXAM_DAYS.findIndex((exam) => exam.date >= day);
      if (nextExamIndex !== -1) {
        setSelectedIndex(nextExamIndex);
      } else {
        setSelectedIndex(EXAM_DAYS.length - 1);
      }
    } else {
      setSelectedIndex(0);
    }
  }, []);

  const selectedExam = EXAM_DAYS[selectedIndex];

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

    return { milestones, startPercent, endPercent, totalSpan, beforeMin };
  }, [selectedExam]);

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
      } else if (
        currentMin >=
        timelineData.beforeMin + timelineData.totalSpan
      ) {
        setProgressPercent(100);
      } else {
        const percent =
          ((currentMin - timelineData.beforeMin) / timelineData.totalSpan) *
          100;
        setProgressPercent(percent);
      }
    } else {
      if (currentMonth === 8 && currentDay > selectedExam.date) {
        setProgressPercent(100);
      } else {
        setProgressPercent(0);
      }
    }
  }, [selectedExam, selectedIndex, timelineData]);

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < EXAM_DAYS.length - 1;

  const handlePrev = () => canPrev && setSelectedIndex((prev) => prev - 1);
  const handleNext = () => canNext && setSelectedIndex((prev) => prev + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && canNext) handleNext();
      else if (diff < 0 && canPrev) handlePrev();
    }
  };

  // GSAP Brutalist Animation
  useLayoutEffect(() => {
    if (!timelineRef.current || isCongrats || !timelineData) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".timeline-base-line",
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 0.6, ease: "power4.out" },
        0,
      );

      tl.fromTo(
        ".timeline-progress-line",
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: progressPercent / 100, duration: 0.6, ease: "power4.out" },
        0.1,
      );

      tl.fromTo(
        ".timeline-exam-box",
        { opacity: 0, x: -30, scaleY: 0.8, transformOrigin: "left center" },
        { opacity: 1, x: 0, scaleY: 1, duration: 0.5, ease: "power4.out" },
        0.2,
      );

      tl.fromTo(
        ".timeline-milestone",
        { scale: 0, opacity: 0, rotate: 0 },
        {
          scale: 1,
          opacity: 1,
          rotate: 45,
          duration: 0.4,
          stagger: 0.08,
          ease: "power4.out",
        },
        0.3,
      );

      tl.fromTo(
        ".timeline-label",
        { x: -20, opacity: 0, xPercent: -100, yPercent: -50 },
        {
          x: 0,
          opacity: 1,
          xPercent: -100,
          yPercent: -50,
          duration: 0.4,
          stagger: 0.08,
          ease: "power4.out",
        },
        0.3,
      );

      tl.fromTo(
        ".nav-date-wrapper",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power4.out" },
        0,
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
            MISSION
            <br />
            COMPLETE<span>.</span>
          </h2>
          <p>[ SYSTEM_MSG: EXAMS_FINISHED ]</p>
        </div>
      ) : (
        <>
          <div className="exam-header">
            <div>
              <div className="exam-eyebrow">▶ EXAM_PROTOCOL</div>
              <h2 className="exam-title">
                AUG 24–29<span>.</span>
              </h2>
              <p className="exam-subtitle">
                [ MID-TERM_EXAMINATIONS // 2569/1 ]
              </p>
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
                  {selectedExam ? `${selectedExam.date} AUG` : ""}
                  {isToday && <span className="today-badge">[ LIVE ]</span>}
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
                <div className="timeline-base-line"></div>
                <div
                  className="timeline-progress-line"
                  style={{ height: `${progressPercent}%` }}
                ></div>

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

                {timelineData.milestones.map((milestone, idx) => {
                  const percent =
                    ((milestone.time - timelineData.beforeMin) /
                      timelineData.totalSpan) *
                    100;
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
