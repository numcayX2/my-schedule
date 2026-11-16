"use client";

import React, { useEffect, useRef, useState } from "react";
import { Badge, Tooltip } from "@radix-ui/themes";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import ScheduleBottomNav from "./ScheduleBottomNav";
import { CLASSES, COURSE_TONES, DAYS, TIMES, getSessionGrid, getSessionTime, type ClassSession } from "./schedule-data";
import useDayNavigation from "./useDayNavigation";

const MOBILE_SCHEDULE = DAYS.map((day) => ({
  ...day,
  classes: CLASSES.filter((session) => session.day === day.id)
    .sort((a, b) => a.start.localeCompare(b.start)),
}));

const UNIQUE_COURSES = new Set(CLASSES.map((session) => session.code)).size;

function ClassCard({
  session,
  index,
  shouldReduceMotion,
}: {
  session: ClassSession;
  index: number;
  shouldReduceMotion?: boolean | null;
}) {
  return (
    <motion.article
      className="class-card"
      data-tone={COURSE_TONES[session.code]}
      data-index={String(index + 1).padStart(2, "0")}
      style={getSessionGrid(session)}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.93, y: 8 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.34,
        delay: 0.26 + index * 0.024,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="class-card-top">
        <span className="class-card-pip" aria-hidden="true" />
        <span className="class-card-code">{session.code}</span>
        <span className="class-card-time">{getSessionTime(session)}</span>
      </div>
      <h3 className="class-card-name">{session.name}</h3>
      <div className="class-card-meta">
        <span className="class-card-room">ห้อง {session.room}</span>
        <span>กลุ่ม {session.section}</span>
        <span>{session.type === "LEC" ? "บรรยาย" : "ปฏิบัติ"} · {session.type}</span>
      </div>
      <span className="class-card-barcode" aria-hidden="true" />
    </motion.article>
  );
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

    const handleMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      setIsCursorActive(true);

      const target = event.target as Element | null;
      setIsHovering(target?.closest("button, a") !== null);
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);
    const handleLeave = () => {
      setIsCursorActive(false);
      setIsHovering(false);
      setIsClicking(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [shouldReduceMotion, mouseX, mouseY]);

  return (
    <div className="schedule-root" ref={rootRef}>
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
          transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left" }}
        />

        <motion.header
          className="schedule-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
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
                <Badge variant="solid" color="orange" size="2" radius="none" className="hero-sticker">
                  ROUTE DOSSIER
                </Badge>
                <span className="schedule-eyebrow">{"// ISSUE 02 · 2569"}</span>
              </div>
              <h1 className="schedule-title">
                <motion.span
                  className="title-line"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -28 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.42, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  CLASS
                </motion.span>
                <motion.span
                  className="title-line"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -28 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.42, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="title-slash">/</span>SCHEDULE<span className="title-accent">.</span>
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
              transition={{ duration: 0.48, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <Tooltip content="Master Schedule Academic Load Monitor">
                <div className="dashboard-mark" style={{ cursor: "help" }}><span>WEEKLY LOAD</span><strong>M/S</strong></div>
              </Tooltip>
              <span className="dashboard-stamp">PRINTED<br />SHEET 02</span>
              <div className="session-count">
                <strong>{String(CLASSES.length).padStart(2, "0")}</strong>
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
          transition={{ duration: 0.52, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
                initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                transition={{
                  duration: 0.36,
                  delay: 0.1 + dayIndex * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
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
                  day.classes.map((session) => {
                    const sessionIndex = CLASSES.findIndex(
                      (item) => item.code === session.code && item.day === session.day && item.start === session.start,
                    );
                    return (
                      <article
                        className="mobile-class"
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
                      </article>
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
