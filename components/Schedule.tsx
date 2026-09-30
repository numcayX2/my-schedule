"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import ScheduleBottomNav from "./ScheduleBottomNav";
import { CLASSES, COURSE_TONES, DAYS, TIMES, getSessionGrid, getSessionTime, type ClassSession } from "./schedule-data";
import useDayNavigation from "./useDayNavigation";

function ClassCard({ session, index }: { session: ClassSession; index: number }) {
  return (
    <article
      className="class-card"
      data-tone={COURSE_TONES[session.code]}
      data-index={String(index + 1).padStart(2, "0")}
      style={getSessionGrid(session)}
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
    </article>
  );
}

export default function Schedule() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { dayRefs, activeDay, scrollToDay } = useDayNavigation();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mobileSchedule = useMemo(
    () => DAYS.map((day) => ({
      ...day,
      classes: CLASSES.filter((session) => session.day === day.id)
        .sort((a, b) => a.start.localeCompare(b.start)),
    })),
    [],
  );
  const uniqueCourses = useMemo(() => new Set(CLASSES.map((session) => session.code)).size, []);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });
      timeline
        .fromTo(".signal-rail", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: .45 })
        .fromTo(".schedule-header", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .58 }, .08)
        .fromTo(".schedule-title .title-line", { opacity: 0, x: -34 }, { opacity: 1, x: 0, duration: .52, stagger: .08 }, .22)
        .fromTo(".hero-dashboard", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: .58 }, .28)
        .fromTo(".schedule-board", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .55 }, .44)
        .fromTo(".class-card", { opacity: 0, scale: .86 }, { opacity: 1, scale: 1, duration: .35, stagger: .035, clearProps: "transform,opacity" }, .58)
        .fromTo(".mobile-day", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: .42, stagger: .06, clearProps: "transform,opacity" }, .5);
    }, rootRef);
    return () => media.revert();
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const media = gsap.matchMedia();
    const root = document.documentElement;
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      // The stylesheet only hides the native cursor while this class is on the
      // document, so a failed effect can never leave the page cursorless.
      root.classList.add("custom-cursor");
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
      const dotX = gsap.quickTo(dot, "x", { duration: .08, ease: "power3.out" });
      const dotY = gsap.quickTo(dot, "y", { duration: .08, ease: "power3.out" });
      const ringX = gsap.quickTo(ring, "x", { duration: .32, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: .32, ease: "power3.out" });
      const handleMove = (event: MouseEvent) => {
        dot.classList.add("visible");
        ring.classList.add("visible");
        ring.classList.toggle("hovering", event.target instanceof Element && event.target.closest("button") !== null);
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
      };
      const handleDown = () => ring.classList.add("clicking");
      const handleUp = () => ring.classList.remove("clicking");
      const handleLeave = () => {
        dot.classList.remove("visible");
        ring.classList.remove("visible", "hovering", "clicking");
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
        handleLeave();
        gsap.killTweensOf([dot, ring]);
      };
    });
    return () => media.revert();
  }, []);

  return (
    <div className="schedule-root" ref={rootRef}>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />

      <a className="skip-link" href="#schedule">ข้ามไปตารางเรียน</a>
      <div className="content-shell">
        <div className="signal-rail" aria-hidden="true" />

        <header className="schedule-header">
          <div className="schedule-header-top">
            <span className="system-label">COURSE CONTROL / 01</span>
            <div className="header-status">
              <span className="status-dot" aria-hidden="true" />
              <span className="system-label">SYSTEM ONLINE / TERM 1</span>
            </div>
          </div>
          <div className="schedule-header-main">
            <div className="hero-copy">
              <div className="hero-document-line">
                <span className="hero-sticker">ROUTE DOSSIER</span>
                <span className="schedule-eyebrow">{"// ISSUE 01 · 2569"}</span>
              </div>
              <h1 className="schedule-title">
                <span className="title-line">CLASS</span>
                <span className="title-line"><span className="title-slash">/</span>SCHEDULE<span className="title-accent">.</span></span>
              </h1>
              <p className="schedule-subtitle">
                ตารางเรียน · ภาคการศึกษาที่ 1/2569
              </p>
              <div className="hero-print-line">
                <span className="hero-barcode" aria-hidden="true" />
                <span>WEEKLY ROUTE / CAMPUS ISSUE</span>
              </div>
            </div>
            <aside className="hero-dashboard" aria-label="สรุปตารางเรียน">
              <div className="dashboard-mark"><span>WEEKLY LOAD</span><strong>M/S</strong></div>
              <span className="dashboard-stamp">PRINTED<br />SHEET 01</span>
              <div className="session-count">
                <strong>{String(CLASSES.length).padStart(2, "0")}</strong>
                <span>CLASS SESSIONS</span>
              </div>
              <div className="dashboard-stats">
                <div className="dashboard-stat"><span>COURSES</span><strong>0{uniqueCourses}</strong></div>
                <div className="dashboard-stat"><span>SEMESTER</span><strong>1/69</strong></div>
              </div>
            </aside>
          </div>
        </header>

        <main className="schedule-board" id="schedule" tabIndex={-1} aria-labelledby="weekly-grid-title">
          <div className="board-heading">
            <span className="board-index">02</span>
            <h2 className="board-title" id="weekly-grid-title">WEEKLY <span>ROUTING</span></h2>
            <span className="board-stamp">ROUTE SHEET<br />V1.0</span>
            <span className="board-note">MON-FRI / 09:00-19:00<br />ALL TIMES ICT (UTC+7)</span>
          </div>

          <div className="schedule-main" role="region" aria-label="ตารางเรียนรายสัปดาห์ เลื่อนแนวนอนเพื่อดูเวลาทั้งหมด" tabIndex={0}>
            <div className="schedule-grid-wrap">
              <div className="schedule-grid">
                <div className="schedule-corner" aria-hidden="true">DAY<br />TIME</div>
                {TIMES.map((time) => <div className="schedule-time-header" aria-hidden="true" key={time}>{time}</div>)}
                {DAYS.map((day, rowIndex) => (
                  <React.Fragment key={day.id}>
                    <div className="schedule-day" style={{ gridRowStart: rowIndex + 2, gridColumnStart: 1 }}>
                      <strong>{day.short}</strong><span>{day.label.slice(0, 3)}</span>
                    </div>
                    {TIMES.map((time, columnIndex) => (
                      <div
                        className="schedule-cell" aria-hidden="true"
                        key={`${day.id}-${time}`}
                        style={{ gridRowStart: rowIndex + 2, gridColumnStart: columnIndex + 2 }}
                      />
                    ))}
                  </React.Fragment>
                ))}
                {CLASSES.map((session, index) => (
                  <ClassCard session={session} index={index} key={`${session.code}-${session.day}-${session.start}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="board-legend" aria-label="ตารางเรียนข้อมูลประกอบ">
            <span><i className="legend-mark signal" /> SESSION MAP / 12 BLOCKS</span>
            <span><i className="legend-mark paper" /> LEC · LAB · ROOM NUMBER</span>
            <span>DO NOT LOSE THIS SHEET</span>
          </div>

          <div className="schedule-mobile-list" aria-label="ตารางเรียนรายวัน">
            {mobileSchedule.map((day) => (
              <section
                className="mobile-day"
                aria-labelledby={`day-title-${day.id}`}
                id={`day-${day.id}`}
                key={day.id}
                ref={(element) => { dayRefs.current[day.id] = element; }}
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
              </section>
            ))}
          </div>
        </main>
      </div>

      <footer className="schedule-footer">
        <span>MY SCHEDULE / ACADEMIC CONTROL</span>
        <span>TERM 01 · 2569</span>
      </footer>
      <ScheduleBottomNav
        days={DAYS}
        activeDay={activeDay}
        onDayClick={scrollToDay}
      />
    </div>
  );
}
