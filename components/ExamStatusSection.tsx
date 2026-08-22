"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

interface ExamDay {
  date: number;
  day: string;
  dayCode: string;
  start: string;
  end: string;
  code: string;
  course: string;
  location?: string;
  abbr: string;
}

type ExamPhase = "upcoming" | "live" | "complete";

const EXAM_YEAR = 2026;
const EXAM_MONTH = 8;
const TIMEZONE_OFFSET = "+07:00";

const EXAM_DAYS: ExamDay[] = [
  {
    date: 24,
    day: "วันจันทร์",
    dayCode: "MON",
    start: "12:00",
    end: "15:00",
    code: "10301371",
    course: "ปัญญาประดิษฐ์",
    location: "วิทย์ 2205",
    abbr: "AI",
  },
  {
    date: 25,
    day: "วันอังคาร",
    dayCode: "TUE",
    start: "12:00",
    end: "15:00",
    code: "10301351",
    course: "วิทยาการข้อมูล",
    location: "ห้องสอบวิทย์ 60 ปี 2205",
    abbr: "DS",
  },
  {
    date: 26,
    day: "วันพุธ",
    dayCode: "WED",
    start: "12:00",
    end: "15:00",
    code: "10301374",
    course: "การประมวลผลภาษาธรรมชาติ",
    location: "ชั้น 6 ห้อง Lab 2 ตึก 60 ปี คณะวิทยาศาสตร์",
    abbr: "NLP",
  },
  {
    date: 27,
    day: "วันพฤหัสบดี",
    dayCode: "THU",
    start: "12:00",
    end: "15:00",
    code: "10301364",
    course: "ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ",
    location: "วิทย์ 2205",
    abbr: "DLI",
  },
  {
    date: 28,
    day: "วันศุกร์",
    dayCode: "FRI",
    start: "15:00",
    end: "18:00",
    code: "10300411",
    course: "วิทยาศาสตร์เพื่อชีวิต",
    location: "Microsoft Teams",
    abbr: "SFL",
  },
  {
    date: 29,
    day: "วันเสาร์",
    dayCode: "SAT",
    start: "12:00",
    end: "15:00",
    code: "10700320",
    course: "ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ",
    location: "80-305 สำรอง",
    abbr: "ENG",
  },
];

function examDate(exam: ExamDay, time: "start" | "end") {
  const value = time === "start" ? exam.start : exam.end;
  return new Date(
    `${EXAM_YEAR}-${String(EXAM_MONTH).padStart(2, "0")}-${String(exam.date).padStart(2, "0")}T${value}:00${TIMEZONE_OFFSET}`,
  );
}

function getPhase(exam: ExamDay, now: Date | null): ExamPhase {
  if (!now || now < examDate(exam, "start")) return "upcoming";
  if (now <= examDate(exam, "end")) return "live";
  return "complete";
}

const PHASE_LABEL: Record<ExamPhase, string> = {
  upcoming: "UP NEXT",
  live: "IN PROGRESS",
  complete: "COMPLETE",
};

const CSS = `
  .exam-section {
    max-width: 1400px;
    margin: 48px auto 0;
    color: var(--white);
    border: 1px solid var(--line-strong);
    background: var(--panel);
    position: relative;
    overflow: hidden;
    box-shadow: 12px 12px 0 rgba(0, 0, 0, 0.28);
  }

  .exam-section::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(115deg, transparent 0 72%, rgba(255, 105, 31, 0.035) 72% 73%, transparent 73%),
      repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.012) 3px 4px);
  }

  .exam-stripe {
    height: 9px;
    border-bottom: 1px solid var(--line-strong);
    background: repeating-linear-gradient(
      135deg,
      var(--orange) 0 11px,
      #202124 11px 22px
    );
  }

  .exam-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 32px;
    padding: 30px 32px 26px;
    border-bottom: 1px solid var(--line-strong);
    position: relative;
  }

  .exam-kicker,
  .exam-counter,
  .exam-course-code,
  .exam-day-code,
  .exam-phase,
  .exam-meta-label,
  .exam-location-label,
  .exam-time-label,
  .exam-file-label {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: .13em;
  }

  .exam-kicker {
    color: var(--orange);
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .exam-title {
    margin: 0;
    font-size: clamp(34px, 5.2vw, 66px);
    line-height: .95;
    letter-spacing: -.055em;
    font-weight: 900;
  }

  .exam-title span { color: var(--orange); }

  .exam-subtitle {
    color: var(--text-muted);
    margin: 14px 0 0;
    font-size: 14px;
  }

  .exam-counter {
    align-self: stretch;
    min-width: 164px;
    padding: 13px 16px;
    display: grid;
    align-content: space-between;
    gap: 16px;
    color: var(--text-muted);
    border: 1px solid var(--line);
    background: var(--surface);
    font-size: 10px;
  }

  .exam-counter strong {
    color: var(--white);
    font-size: 30px;
    line-height: 1;
    letter-spacing: -.04em;
  }

  .exam-counter strong span { color: var(--orange); }

  .exam-day-rail {
    display: grid;
    grid-template-columns: repeat(6, minmax(125px, 1fr));
    border-bottom: 1px solid var(--line-strong);
    overflow-x: auto;
    scrollbar-color: var(--orange) var(--surface);
  }

  .exam-day-button {
    appearance: none;
    min-width: 125px;
    padding: 16px 18px 15px;
    text-align: left;
    color: var(--text-muted);
    background: var(--panel);
    border: 0;
    border-right: 1px solid var(--line);
    position: relative;
    transition: color .22s ease, background .22s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .exam-day-button:last-child { border-right: 0; }

  .exam-day-button::after {
    content: "";
    position: absolute;
    left: 0;
    right: 100%;
    bottom: 0;
    height: 3px;
    background: var(--orange);
    transition: right .35s cubic-bezier(.16, 1, .3, 1);
  }

  .exam-day-button:hover { color: var(--white); background: var(--surface-raised); }
  .exam-day-button.active { color: var(--white); background: var(--surface-raised); }
  .exam-day-button.active::after { right: 0; }

  .exam-day-button.complete .exam-day-number { color: #777b80; }
  .exam-day-button.live .exam-day-number { color: var(--orange); }

  .exam-day-code {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 9px;
    font-weight: 800;
  }

  .exam-day-number {
    display: block;
    margin: 8px 0 3px;
    color: var(--white);
    font: 900 30px/1 var(--font-display);
    letter-spacing: -.04em;
  }

  .exam-day-time {
    font: 600 11px/1.4 var(--font-mono);
    letter-spacing: .02em;
  }

  .exam-phase-dot {
    width: 6px;
    height: 6px;
    margin-top: 2px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 3px rgba(255,255,255,.04);
  }

  .exam-day-button.live .exam-phase-dot {
    color: var(--orange);
    animation: exam-blink 1.4s ease-in-out infinite;
  }

  .exam-detail {
    min-height: 390px;
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    position: relative;
  }

  .exam-file {
    padding: 30px 28px;
    border-right: 1px solid var(--line-strong);
    background:
      linear-gradient(155deg, rgba(255,105,31,.14), transparent 48%),
      var(--surface);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .exam-file::after {
    content: attr(data-index);
    position: absolute;
    right: -15px;
    bottom: -37px;
    color: rgba(255,255,255,.035);
    font: 900 180px/1 var(--font-display);
    letter-spacing: -.08em;
  }

  .exam-file-label {
    color: var(--text-muted);
    font-size: 10px;
  }

  .exam-file-date {
    position: relative;
    z-index: 1;
  }

  .exam-file-date strong {
    display: block;
    color: var(--orange);
    font: 900 clamp(76px, 9vw, 116px)/.8 var(--font-display);
    letter-spacing: -.08em;
  }

  .exam-file-date span {
    display: block;
    margin-top: 17px;
    font: 800 13px/1.4 var(--font-mono);
    letter-spacing: .12em;
  }

  .exam-phase {
    width: fit-content;
    padding: 7px 9px;
    color: var(--white);
    background: #292b2e;
    border: 1px solid var(--line);
    font-size: 9px;
    font-weight: 800;
    position: relative;
    z-index: 1;
  }

  .exam-phase.live { color: var(--ink); background: var(--orange); border-color: var(--orange); }

  .exam-detail-main {
    min-width: 0;
    padding: 32px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 30px;
  }

  .exam-course-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }

  .exam-course-code {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--orange);
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 9px;
  }

  .exam-course-code::before {
    content: "";
    width: 18px;
    height: 2px;
    background: var(--orange);
  }

  .exam-course-name {
    max-width: 820px;
    margin: 0;
    color: var(--white);
    font-size: clamp(25px, 3.3vw, 46px);
    line-height: 1.12;
    letter-spacing: -.035em;
    font-weight: 900;
  }

  .exam-abbr {
    flex: 0 0 auto;
    min-width: 54px;
    height: 54px;
    padding: 0 8px;
    display: grid;
    place-items: center;
    color: var(--ink);
    background: var(--orange);
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    font: 900 13px/1 var(--font-mono);
  }

  .exam-meta-grid {
    display: grid;
    grid-template-columns: minmax(180px, .7fr) minmax(260px, 1.3fr);
    gap: 12px;
    align-content: start;
  }

  .exam-meta-card {
    padding: 17px 18px;
    border: 1px solid var(--line);
    background: rgba(255,255,255,.018);
  }

  .exam-meta-label,
  .exam-location-label,
  .exam-time-label {
    display: block;
    color: var(--text-muted);
    font-size: 9px;
    margin-bottom: 7px;
  }

  .exam-meta-value {
    color: var(--white);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.45;
  }

  .exam-meta-value.mono {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: -.02em;
  }

  .exam-timeline {
    padding-top: 3px;
  }

  .exam-time-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 13px;
  }

  .exam-time-head .exam-time-label { margin: 0; }

  .exam-track {
    position: relative;
    height: 42px;
  }

  .exam-track-line,
  .exam-track-progress {
    position: absolute;
    top: 10px;
    left: 0;
    height: 3px;
  }

  .exam-track-line { width: 100%; background: var(--line-strong); }

  .exam-track-progress {
    background: var(--orange);
    box-shadow: 0 0 16px rgba(255,105,31,.32);
    transform-origin: left center;
  }

  .exam-track-tick {
    position: absolute;
    top: 5px;
    width: 12px;
    height: 12px;
    border: 2px solid #707378;
    background: var(--panel);
    transform: translateX(-50%) rotate(45deg);
  }

  .exam-track-tick.edge-start { transform: rotate(45deg); }
  .exam-track-tick.edge-end { transform: translateX(-100%) rotate(45deg); }

  .exam-track-tick.active {
    border-color: var(--orange);
    background: var(--orange);
  }

  .exam-track-label {
    position: absolute;
    top: 24px;
    color: var(--text-muted);
    font: 700 10px/1 var(--font-mono);
    transform: translateX(-50%);
  }

  .exam-track-label.edge-start { transform: none; }
  .exam-track-label.edge-end { transform: translateX(-100%); }

  .exam-detail-nav {
    display: flex;
    gap: 8px;
  }

  .exam-nav-button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    color: var(--white);
    background: var(--surface);
    border: 1px solid var(--line-strong);
    font-size: 22px;
    transition: color .2s ease, background .2s ease, border-color .2s ease;
  }

  .exam-nav-button:not(:disabled):hover {
    color: var(--ink);
    background: var(--orange);
    border-color: var(--orange);
  }

  .exam-nav-button:disabled { color: #4c4e52; opacity: .55; }

  @keyframes exam-blink {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 3px rgba(255,105,31,.12); }
    50% { opacity: .45; box-shadow: 0 0 0 7px rgba(255,105,31,0); }
  }

  @media (max-width: 820px) {
    .exam-section { margin-top: 32px; box-shadow: 7px 7px 0 rgba(0,0,0,.25); }
    .exam-header { grid-template-columns: 1fr; padding: 24px 20px; gap: 20px; }
    .exam-counter { min-width: 0; grid-template-columns: 1fr auto; align-items: center; }
    .exam-detail { grid-template-columns: 138px minmax(0, 1fr); }
    .exam-file { padding: 24px 18px; }
    .exam-file-date strong { font-size: 72px; }
    .exam-detail-main { padding: 24px 20px; }
    .exam-meta-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 560px) {
    .exam-section { margin-top: 26px; }
    .exam-title { font-size: 34px; }
    .exam-subtitle { font-size: 12px; }
    .exam-detail { display: block; min-height: 0; }
    .exam-file {
      min-height: 116px;
      padding: 18px 20px;
      border-right: 0;
      border-bottom: 1px solid var(--line-strong);
      flex-direction: row;
      align-items: center;
      gap: 18px;
    }
    .exam-file-date { display: flex; align-items: center; gap: 14px; }
    .exam-file-date strong { font-size: 66px; }
    .exam-file-date span { margin-top: 0; }
    .exam-file-label { display: none; }
    .exam-file::after { font-size: 120px; bottom: -30px; }
    .exam-detail-main { padding: 22px 20px 26px; gap: 24px; }
    .exam-course-name { font-size: 27px; }
    .exam-abbr { min-width: 46px; height: 46px; }
    .exam-meta-grid { gap: 8px; }
    .exam-meta-card { padding: 14px; }
    .exam-detail-nav { display: none; }
    .exam-day-rail { grid-template-columns: repeat(6, 118px); }
    .exam-day-button { min-width: 118px; padding-inline: 15px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .exam-day-button,
    .exam-day-button::after,
    .exam-nav-button { transition: none; }
    .exam-day-button.live .exam-phase-dot { animation: none; }
  }
`;

export default function ExamStatusSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  const selectedExam = EXAM_DAYS[selectedIndex];
  const selectedPhase = getPhase(selectedExam, now);

  useEffect(() => {
    const syncClock = () => setNow(new Date());
    const selectCurrentExam = () => {
      const current = new Date();
      const activeIndex = EXAM_DAYS.findIndex(
        (exam) => current <= examDate(exam, "end"),
      );

      setNow(current);
      setSelectedIndex(
        activeIndex === -1 ? EXAM_DAYS.length - 1 : activeIndex,
      );
    };

    const frame = window.requestAnimationFrame(selectCurrentExam);
    const timer = window.setInterval(syncClock, 30_000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  const timeline = useMemo(() => {
    const start = examDate(selectedExam, "start").getTime();
    const end = examDate(selectedExam, "end").getTime();
    const elapsed = now ? now.getTime() - start : 0;
    const progress = Math.min(100, Math.max(0, (elapsed / (end - start)) * 100));
    const ticks = [0, 1, 2, 3].map((hour) => ({
      position: (hour / 3) * 100,
      label: `${String(Number(selectedExam.start.slice(0, 2)) + hour).padStart(2, "0")}:00`,
    }));

    return { progress, ticks };
  }, [now, selectedExam]);

  useLayoutEffect(() => {
    if (!detailRef.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [".exam-file-date", ".exam-course-top", ".exam-meta-card", ".exam-timeline"],
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.055,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }, detailRef);

    return () => ctx.revert();
  }, [selectedIndex]);

  const selectPrevious = () =>
    setSelectedIndex((index) => Math.max(0, index - 1));
  const selectNext = () =>
    setSelectedIndex((index) => Math.min(EXAM_DAYS.length - 1, index + 1));

  const handleTouchEnd = (event: React.TouchEvent) => {
    const distance = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(distance) < 50) return;
    if (distance > 0) selectNext();
    else selectPrevious();
  };

  return (
    <section
      className="exam-section"
      aria-labelledby="exam-section-title"
    >
      <style>{CSS}</style>
      <div className="exam-stripe" aria-hidden="true" />

      <header className="exam-header">
        <div>
          <div className="exam-kicker">● EXAM ARCHIVE / AUGUST 2026</div>
          <h2 className="exam-title" id="exam-section-title">
            ตารางสอบ<span>กลางภาค</span>
          </h2>
          <p className="exam-subtitle">
            วันที่ 24–29 สิงหาคม 2569 · ภาคการศึกษาที่ 1/2569
          </p>
        </div>
        <div className="exam-counter" aria-label="จำนวนวันสอบทั้งหมด 6 วัน">
          <span>TOTAL EXAM DAYS</span>
          <strong>
            0<span>6</span>
          </strong>
        </div>
      </header>

      <div className="exam-day-rail" aria-label="เลือกวันสอบ">
        {EXAM_DAYS.map((exam, index) => {
          const phase = getPhase(exam, now);
          return (
            <button
              type="button"
              key={exam.code}
              className={`exam-day-button ${phase} ${index === selectedIndex ? "active" : ""}`}
              onClick={() => setSelectedIndex(index)}
              aria-pressed={index === selectedIndex}
              aria-label={`${exam.day}ที่ ${exam.date} สิงหาคม วิชา ${exam.course}`}
            >
              <span className="exam-day-code">
                {exam.dayCode}
                <span className="exam-phase-dot" aria-hidden="true" />
              </span>
              <span className="exam-day-number">{exam.date}</span>
              <span className="exam-day-time">
                {exam.start}—{exam.end}
              </span>
            </button>
          );
        })}
      </div>

      <article
        className="exam-detail"
        ref={detailRef}
        aria-live="polite"
        aria-label={`รายละเอียดสอบวิชา ${selectedExam.course}`}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <aside className="exam-file" data-index={String(selectedIndex + 1).padStart(2, "0")}>
          <span className="exam-file-label">EXAM FILE / {String(selectedIndex + 1).padStart(2, "0")}</span>
          <div className="exam-file-date">
            <strong>{selectedExam.date}</strong>
            <span>
              AUG / 26
              <br />
              {selectedExam.dayCode}
            </span>
          </div>
          <span className={`exam-phase ${selectedPhase}`}>
            {PHASE_LABEL[selectedPhase]}
          </span>
        </aside>

        <div className="exam-detail-main">
          <div className="exam-course-top">
            <div>
              <span className="exam-course-code">{selectedExam.code}</span>
              <h3 className="exam-course-name">{selectedExam.course}</h3>
            </div>
            <span className="exam-abbr" aria-hidden="true">
              {selectedExam.abbr}
            </span>
          </div>

          <div className="exam-meta-grid">
            <div className="exam-meta-card">
              <span className="exam-meta-label">DATE / TIME</span>
              <span className="exam-meta-value mono">
                {selectedExam.day} · {selectedExam.start}–{selectedExam.end} น.
              </span>
            </div>
            <div className="exam-meta-card">
              <span className="exam-location-label">EXAM LOCATION</span>
              <span className="exam-meta-value">
                {selectedExam.location ?? "—"}
              </span>
            </div>
          </div>

          <div className="exam-timeline">
            <div className="exam-time-head">
              <span className="exam-time-label">3 HOUR EXAM WINDOW</span>
              <div className="exam-detail-nav">
                <button
                  type="button"
                  className="exam-nav-button"
                  onClick={selectPrevious}
                  disabled={selectedIndex === 0}
                  aria-label="ดูวันสอบก่อนหน้า"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="exam-nav-button"
                  onClick={selectNext}
                  disabled={selectedIndex === EXAM_DAYS.length - 1}
                  aria-label="ดูวันสอบถัดไป"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="exam-track" aria-label={`เวลา ${selectedExam.start} ถึง ${selectedExam.end} น.`}>
              <div className="exam-track-line" />
              <div
                className="exam-track-progress"
                style={{ width: `${timeline.progress}%` }}
              />
              {timeline.ticks.map((tick, index) => {
                const edgeClass =
                  index === 0
                    ? "edge-start"
                    : index === timeline.ticks.length - 1
                      ? "edge-end"
                      : "";

                return (
                <React.Fragment key={tick.label}>
                  <span
                    className={`exam-track-tick ${edgeClass} ${selectedPhase !== "upcoming" && tick.position <= timeline.progress ? "active" : ""}`}
                    style={{ left: `${tick.position}%` }}
                    aria-hidden="true"
                  />
                  <span
                    className={`exam-track-label ${edgeClass}`}
                    style={{ left: `${tick.position}%` }}
                  >
                    {tick.label}
                  </span>
                </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
