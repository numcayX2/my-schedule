"use client";

import React, { useEffect, useRef, useState } from "react";
import { Badge, Tooltip } from "@radix-ui/themes";
import { animate, motion, steps, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import AmbientBackdrop from "./AmbientBackdrop";
import ClassCard from "./ClassCard";
import ScheduleBottomNav from "./ScheduleBottomNav";
import { EASE_OUT, EASE_SLAM, INTRO } from "./motion-presets";
import { CLASSES, COURSE_TONES, DAYS, TIMES } from "./schedule-data";
import useDayNavigation from "./useDayNavigation";

const MOBILE_SCHEDULE = DAYS.map((day) => ({
  ...day,
  classes: CLASSES.filter((session) => session.day === day.id)
    .sort((a, b) => a.start.localeCompare(b.start)),
}));

const UNIQUE_COURSES = new Set(CLASSES.map((session) => session.code)).size;

// Signal-glitch burst (stepped, not tweened): RGB split + horizontal slice jitter,
// replayed every few seconds like a ZZZ menu losing sync. Rest is repeated at
// the end because steps(1) holds each segment's start value, and the hold
// between repeats must be clean.
const GLITCH_REST = "0px 0 0 rgba(255,91,34,0), 0px 0 0 rgba(200,255,56,0)";
const GLITCH_KEYFRAMES = {
  x: [0, -7, 5, -2, 3, 0, 0],
  textShadow: [
    GLITCH_REST,
    "-5px 0 0 rgba(255,91,34,.9), 5px 0 0 rgba(200,255,56,.85)",
    "4px 0 0 rgba(255,91,34,.9), -3px 0 0 rgba(117,216,255,.85)",
    "-2px 0 0 rgba(255,91,34,.9), 2px 0 0 rgba(200,255,56,.85)",
    "3px 0 0 rgba(255,91,34,.9), -4px 0 0 rgba(200,255,56,.85)",
    GLITCH_REST,
    GLITCH_REST,
  ],
};
const GLITCH_TRANSITION = { duration: 0.3, ease: steps(1), repeat: Infinity, repeatDelay: 4.5 };

// Counts up from zero once the hero lands. Server HTML keeps the real number.
function CountUp({ to, delay, shouldReduceMotion }: { to: number; delay: number; shouldReduceMotion?: boolean | null }) {
  const value = useMotionValue(to);
  const text = useTransform(value, (v) => String(Math.round(v)).padStart(2, "0"));

  useEffect(() => {
    if (shouldReduceMotion) return;
    value.set(0);
    const controls = animate(value, to, { duration: 1.2, delay, ease: EASE_OUT });
    return () => controls.stop();
  }, [shouldReduceMotion, to, delay, value]);

  return <motion.strong>{text}</motion.strong>;
}

export default function Schedule() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { dayRefs, activeDay, scrollToDay } = useDayNavigation();
  const shouldReduceMotion = useReducedMotion();

  // Smooth Motion springs for custom cursor physics
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isCursorActive, setIsCursorActive] = useState(false);

  // High responsiveness for the dot, silky fluid inertia for the ring
  const dotX = useSpring(mouseX, { stiffness: 950, damping: 48 });
  const dotY = useSpring(mouseY, { stiffness: 950, damping: 48 });
  const ringX = useSpring(mouseX, { stiffness: 320, damping: 26 });
  const ringY = useSpring(mouseY, { stiffness: 320, damping: 26 });

  useEffect(() => {
    if (shouldReduceMotion) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor");

    // mousemove only feeds motion values (no React render); hover/active state
    // changes come from mouseover, which fires once per element boundary.
    let inside = false;
    const handleMove = (event: MouseEvent) => {
      if (!inside) {
        // Snap on (re-)entry so the cursor doesn't fly in from its last spot.
        inside = true;
        for (const v of [dotX, ringX]) v.jump(event.clientX);
        for (const v of [dotY, ringY]) v.jump(event.clientY);
      }
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    const handleOver = (event: MouseEvent) => {
      setIsCursorActive(true);
      const target = event.target as Element | null;
      setIsHovering(target?.closest("button, a") != null);
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);
    const handleLeave = () => {
      inside = false;
      setIsCursorActive(false);
      setIsHovering(false);
      setIsClicking(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [shouldReduceMotion, mouseX, mouseY, dotX, dotY, ringX, ringY]);

  return (
    <div className="schedule-root" ref={rootRef}>
      {/* CSS-only so it never blocks the page if hydration is slow or JS is off. */}
      <div className="boot-shutter" aria-hidden="true">
        <div className="boot-panel boot-panel-signal" />
        <div className="boot-panel boot-panel-ink">
          <span className="boot-label">ROUTE // LOADING<b>CLASS SHEET 02</b></span>
        </div>
      </div>
      {!shouldReduceMotion && (
        <AmbientBackdrop mouseX={mouseX} mouseY={mouseY} cursorActive={isCursorActive} />
      )}
      <motion.div
        className={`cursor-ring ${isCursorActive ? "visible" : ""} ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
        aria-hidden="true"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: isClicking ? 0.72 : isHovering ? 1.55 : 1,
              }
        }
        transition={{ type: "spring", stiffness: 450, damping: 26 }}
      />
      <motion.div
        className={`cursor-dot ${isCursorActive ? "visible" : ""}`}
        aria-hidden="true"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: 45,
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: isClicking ? 1.3 : isHovering ? 0.5 : 1,
              }
        }
        transition={{ duration: 0.12 }}
      />

      <a className="skip-link" href="#schedule">ข้ามไปตารางเรียน</a>
      <div className="content-shell">
        <motion.div
          className="signal-rail"
          aria-hidden="true"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          animate={shouldReduceMotion ? {} : { scaleX: 1 }}
          transition={{ duration: 0.46, ease: EASE_OUT }}
          style={{ transformOrigin: "left" }}
        />

        <motion.header
          className="schedule-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: INTRO.header, ease: EASE_OUT }}
        >
          <div className="schedule-header-top">
            <span className="system-label">COURSE CONTROL / 01</span>
            <div className="header-status">
              <span className="status-dot" aria-hidden="true" />
              <Badge variant="surface" color="green" size="1" radius="none">
                SYSTEM ONLINE / TERM 2
              </Badge>
            </div>
          </div>
          <div className="schedule-header-main">
            <div className="hero-copy">
              <div className="hero-document-line">
                <motion.span
                  className="hero-sticker-slam"
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 2.8, rotate: -16 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: INTRO.sticker, duration: 0.4, ease: EASE_SLAM, opacity: { delay: INTRO.sticker, duration: 0.1 } }}
                >
                  <Badge variant="solid" color="orange" size="2" radius="none" className="hero-sticker">
                    ROUTE DOSSIER
                  </Badge>
                </motion.span>
                <span className="schedule-eyebrow">{"// ISSUE 02 · 2569"}</span>
              </div>
              <h1 className="schedule-title">
                <motion.span
                  className="title-line"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -48, skewX: -12, clipPath: "inset(-20% 100% -20% -10%)" }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, skewX: 0, clipPath: "inset(-20% -10% -20% -10%)" }}
                  transition={{ duration: 0.62, delay: INTRO.titleLine1, ease: EASE_OUT }}
                >
                  <motion.span
                    className="title-glitch"
                    animate={shouldReduceMotion ? {} : GLITCH_KEYFRAMES}
                    transition={{ ...GLITCH_TRANSITION, delay: INTRO.glitch }}
                  >
                    CLASS
                  </motion.span>
                </motion.span>
                <motion.span
                  className="title-line"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -48, skewX: -12, clipPath: "inset(-20% 100% -20% -10%)" }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, skewX: 0, clipPath: "inset(-20% -10% -20% -10%)" }}
                  transition={{ duration: 0.62, delay: INTRO.titleLine2, ease: EASE_OUT }}
                >
                  <motion.span
                    className="title-glitch"
                    animate={shouldReduceMotion ? {} : GLITCH_KEYFRAMES}
                    transition={{ ...GLITCH_TRANSITION, delay: INTRO.glitch + 0.07 }}
                  >
                    <span className="title-slash">/</span>SCHEDULE
                    <motion.span
                      className="title-accent"
                      animate={shouldReduceMotion ? {} : { opacity: [1, 0, 1] }}
                      transition={{ delay: INTRO.accent, duration: 0.7, repeat: 3, repeatDelay: 0.5, times: [0, 0.5, 1] }}
                    >
                      .
                    </motion.span>
                  </motion.span>
                </motion.span>
              </h1>
              <p className="schedule-subtitle">
                ตารางเรียน · ภาคการศึกษาที่ 2/2569
              </p>
              <div className="hero-print-line">
                <span className="hero-barcode" aria-hidden="true" />
                <span>WEEKLY ROUTE / CAMPUS ISSUE</span>
              </div>
            </div>
            <motion.aside
              className="hero-dashboard"
              aria-label="สรุปตารางเรียน"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.48, delay: INTRO.dashboard, ease: EASE_OUT }}
            >
              <Tooltip content="Master Schedule Academic Load Monitor">
                <div className="dashboard-mark" style={{ cursor: "help" }}><span>WEEKLY LOAD</span><strong>M/S</strong></div>
              </Tooltip>
              <span className="dashboard-stamp">PRINTED<br />SHEET 02</span>
              <div className="session-count">
                <motion.span
                  className="count-hit"
                  animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1] }}
                  transition={{ delay: INTRO.sfx, duration: 0.24, ease: EASE_OUT }}
                >
                  <CountUp to={CLASSES.length} delay={INTRO.count} shouldReduceMotion={shouldReduceMotion} />
                  <motion.span
                    className="sfx-burst"
                    aria-hidden="true"
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0, rotate: -30 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, scale: [0, 1.35, 1], rotate: [-30, 20, 12] }}
                    transition={{ delay: INTRO.sfx, duration: 0.42, ease: EASE_OUT, opacity: { delay: INTRO.sfx, duration: 0.05 } }}
                  >
                    DING!
                  </motion.span>
                </motion.span>
                <span>CLASS SESSIONS</span>
              </div>
              <div className="dashboard-stats">
                <div className="dashboard-stat"><span>COURSES</span><strong>0{UNIQUE_COURSES}</strong></div>
                <div className="dashboard-stat"><span>SEMESTER</span><strong>2/69</strong></div>
              </div>
            </motion.aside>
          </div>
        </motion.header>

        <motion.main
          className="schedule-board"
          id="schedule"
          tabIndex={-1}
          aria-labelledby="weekly-grid-title"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: INTRO.board, ease: EASE_OUT }}
        >
          <div className="board-heading">
            <span className="board-index">02</span>
            <h2 className="board-title" id="weekly-grid-title">WEEKLY <span>ROUTING</span></h2>
            <span className="board-stamp">ROUTE SHEET<br />V1.0</span>
            <span className="board-note">MON-FRI / 09:00-21:00<br />ALL TIMES ICT (UTC+7)</span>
          </div>

          <div className="schedule-main" role="region" aria-label="ตารางเรียนรายสัปดาห์ เลื่อนแนวนอนเพื่อดูเวลาทั้งหมด" tabIndex={0}>
            <div className="schedule-grid-wrap">
              <div className="schedule-grid">
                <div className="schedule-corner" aria-hidden="true">DAY<br />TIME</div>
                {TIMES.map((time, columnIndex) => (
                  <div
                    className="schedule-time-header"
                    data-edge={columnIndex === 0 ? "start" : columnIndex === TIMES.length - 1 ? "end" : undefined}
                    aria-hidden="true"
                    key={time}
                    style={{ gridColumn: `${columnIndex * 2 + 2} / span 2` }}
                  >
                    <span className="schedule-time-label">{time}</span>
                    {columnIndex === TIMES.length - 1 && (
                      <span className="schedule-time-end">21:00</span>
                    )}
                  </div>
                ))}
                {DAYS.map((day, rowIndex) => (
                  <React.Fragment key={day.id}>
                    <div className="schedule-day" style={{ gridRowStart: rowIndex + 2, gridColumnStart: 1 }}>
                      <strong>{day.short}</strong><span>{day.label.slice(0, 3)}</span>
                    </div>
                    {TIMES.map((time, columnIndex) => (
                      <div
                        className="schedule-cell" aria-hidden="true"
                        key={`${day.id}-${time}`}
                        style={{ gridRowStart: rowIndex + 2, gridColumn: `${columnIndex * 2 + 2} / span 2` }}
                      />
                    ))}
                  </React.Fragment>
                ))}
                {CLASSES.map((session, index) => (
                  <ClassCard
                    session={session}
                    index={index}
                    key={`${session.code}-${session.day}-${session.start}`}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="board-legend" aria-label="ตารางเรียนข้อมูลประกอบ">
            <span><i className="legend-mark signal" /> SESSION MAP / {CLASSES.length} BLOCKS</span>
            <span><i className="legend-mark paper" /> LEC · LAB · ROOM NUMBER</span>
            <span>DO NOT LOSE THIS SHEET</span>
          </div>

          <div className="schedule-mobile-list" aria-label="ตารางเรียนรายวัน">
            {MOBILE_SCHEDULE.map((day, dayIndex) => (
              <motion.section
                className="mobile-day"
                aria-labelledby={`day-title-${day.id}`}
                id={`day-${day.id}`}
                key={day.id}
                ref={(element) => { dayRefs.current[day.id] = element; }}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -22 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.5, delay: dayIndex === 0 ? INTRO.mobileFirstDay : 0, ease: EASE_OUT }}
              >
                <div className="mobile-day-header">
                  <span className="mobile-day-idx">{day.index}</span>
                  <h3 className="mobile-day-title" id={`day-title-${day.id}`}>
                    {day.name}<span className="mobile-day-english" aria-hidden="true">{day.label.slice(0, 3)}</span>
                  </h3>
                  <span className="mobile-day-count">{day.classes.length} คาบ</span>
                </div>
                {day.classes.length === 0 ? (
                  <div className="mobile-day-empty">ไม่มีคาบเรียน / OPEN DAY</div>
                ) : (
                  day.classes.map((session, classIndex) => {
                    const sessionIndex = CLASSES.findIndex(
                      (item) => item.code === session.code && item.day === session.day && item.start === session.start,
                    );
                    return (
                      <motion.article
                        className="mobile-class"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -34, skewX: -6 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0, skewX: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.55, delay: 0.08 + classIndex * 0.08, ease: EASE_OUT }}
                        data-tone={COURSE_TONES[session.code]}
                        data-index={String(sessionIndex + 1).padStart(2, "0")}
                        key={`${session.code}-${session.day}-${session.start}`}
                      >
                        <div className="mobile-class-top">
                          <span className="mobile-class-time"><time dateTime={session.start}>{session.start}</time><span aria-hidden="true">–</span><span className="sr-only"> ถึง </span><time dateTime={session.end}>{session.end}</time></span>
                          <span className="mobile-class-code"><span className="sr-only">รหัสวิชา </span>{session.code}</span>
                        </div>
                        <div className="mobile-class-main">
                          <h4 className="mobile-class-name">{session.name}</h4>
                          <div className="mobile-class-detail">
                            <strong className="mobile-class-room">ห้อง {session.room}</strong>
                            <span>กลุ่ม {session.section}</span>
                            <span>{session.type === "LEC" ? "บรรยาย" : "ปฏิบัติ"} <abbr title={session.type === "LEC" ? "Lecture" : "Laboratory"}>{session.type}</abbr></span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })
                )}
              </motion.section>
            ))}
          </div>
        </motion.main>
      </div>

      <footer className="schedule-footer">
        <span>MY SCHEDULE / ACADEMIC CONTROL</span>
        <span>TERM 02 · 2569</span>
      </footer>
      <ScheduleBottomNav
        days={DAYS}
        activeDay={activeDay}
        onDayClick={scrollToDay}
      />
    </div>
  );
}
