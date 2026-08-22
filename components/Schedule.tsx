"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const DAYS = ["จ.", "อ.", "พ.", "พฤ.", "ศ."];
const DAY_IDS = ["mon", "tue", "wed", "thu", "fri"];
const DAY_LABELS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const CLASSES: ClassCardProps[] = [
  // Monday (row 2)
  {
    name: "วิทยาการข้อมูล",
    code: "10301351",
    detail: "SEC 2 | LEC | 105",
    row: 2,
    colStart: 3,
    colEnd: 5,
  },
  {
    name: "ตรรกศาสตร์เชิงดิจิทัลฯ",
    code: "10301364",
    detail: "SEC 1 | LAB | 105",
    row: 2,
    colStart: 6,
    colEnd: 8,
  },
  {
    name: "ภาษาอังกฤษเพื่อการศึกษาฯ",
    code: "10700320",
    detail: "SEC 2 | LEC | 147",
    row: 2,
    colStart: 8,
    colEnd: 10,
  },

  // Tuesday (row 3)
  {
    name: "ปัญญาประดิษฐ์",
    code: "10301371",
    detail: "SEC 1 | LEC | 141",
    row: 3,
    colStart: 3,
    colEnd: 5,
  },
  {
    name: "วิทยาการข้อมูล",
    code: "10301351",
    detail: "SEC 2 | LAB | 105",
    row: 3,
    colStart: 6,
    colEnd: 9,
  },
  {
    name: "วิทยาศาสตร์เพื่อชีวิต",
    code: "10300411",
    detail: "SEC 5 | LEC | 141",
    row: 3,
    colStart: 10,
    colEnd: 12,
  },

  // Thursday (row 5)
  {
    name: "ตรรกศาสตร์เชิงดิจิทัลฯ",
    code: "10301364",
    detail: "SEC 1 | LAB | 105",
    row: 5,
    colStart: 2,
    colEnd: 5,
  },
  {
    name: "การประมวลผลภาษาธรรมชาติ",
    code: "10301374",
    detail: "SEC 1 | LEC | 105",
    row: 5,
    colStart: 6,
    colEnd: 8,
  },
  {
    name: "ภาษาอังกฤษเพื่อการศึกษาฯ",
    code: "10700320",
    detail: "SEC 2 | LEC | 147",
    row: 5,
    colStart: 8,
    colEnd: 10,
  },

  // Friday (row 6)
  {
    name: "การประมวลผลภาษาธรรมชาติ",
    code: "10301374",
    detail: "SEC 1 | LAB | 105",
    row: 6,
    colStart: 2,
    colEnd: 5,
  },
  {
    name: "ปัญญาประดิษฐ์",
    code: "10301371",
    detail: "SEC 1 | LAB | 105",
    row: 6,
    colStart: 6,
    colEnd: 9,
  },
  {
    name: "วิทยาศาสตร์เพื่อชีวิต",
    code: "10300411",
    detail: "SEC 5 | LEC | 141",
    row: 6,
    colStart: 10,
    colEnd: 12,
  },
];

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  :root {
    --bg: #151617;
    --panel: #191a1c;
    --surface: #202124;
    --surface-raised: #282a2d;
    --orange: #ff691f;
    --lime: #A6EC34;
    --white: #f4f1ea;
    --ink: #131415;
    --gray: #202124;
    --border: #34363a;
    --line: #34363a;
    --line-strong: #55585d;
    --text-muted: #96999e;
    --font-display: "Leelawadee UI", "Noto Sans Thai", Tahoma, sans-serif;
    --font-mono: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--bg);
    overflow-x: hidden;
    font-family: var(--font-display);
    text-rendering: optimizeLegibility;
  }

  ::selection { color: var(--ink); background: var(--orange); }

  button:focus-visible,
  [role="button"]:focus-visible {
    outline: 2px solid var(--orange);
    outline-offset: 3px;
  }

  /* ── Soft orbital cursor (desktop only) ── */
  .cursor-ink-dot, .cursor-ink-blob-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 9999;
    display: none;
    opacity: 0;
    transition: opacity .22s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .schedule-root, .schedule-root * {
      cursor: none !important;
    }
    
    .cursor-ink-dot, .cursor-ink-blob-wrapper {
      display: block;
    }

    .cursor-ink-dot.visible,
    .cursor-ink-blob-wrapper.visible { opacity: 1; }

    .cursor-ink-dot {
      width: 5px;
      height: 5px;
      background: var(--orange);
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(255, 105, 31, .75);
    }

    .cursor-ink-blob-inner {
      width: 38px;
      height: 38px;
      border: 1px solid rgba(244, 241, 234, .65);
      border-radius: 50%;
      background: rgba(255, 255, 255, .018);
      backdrop-filter: blur(1px);
      box-shadow: inset 0 0 0 5px rgba(255, 255, 255, .018);
      position: relative;
      transition:
        width .36s cubic-bezier(.16, 1, .3, 1),
        height .36s cubic-bezier(.16, 1, .3, 1),
        background .3s ease,
        border-color .3s ease,
        transform .3s ease;
    }

    .cursor-ink-blob-inner::before {
      content: "";
      position: absolute;
      width: 6px;
      height: 6px;
      top: 1px;
      left: 50%;
      border-radius: 50%;
      background: var(--orange);
      box-shadow: 0 0 8px rgba(255, 105, 31, .65);
      transform: translate(-50%, -50%);
    }

    .cursor-ink-blob-inner::after {
      content: "";
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      border: 1px solid rgba(255, 105, 31, .28);
    }

    .cursor-ink-blob-wrapper.hovering .cursor-ink-blob-inner {
      width: 58px;
      height: 58px;
      background: rgba(255, 105, 31, .1);
      border-color: var(--orange);
    }

    .cursor-ink-blob-wrapper.clicking .cursor-ink-blob-inner {
      width: 28px;
      height: 28px;
      background: rgba(255, 105, 31, .24);
      transform: rotate(45deg);
    }
  }

  .schedule-root {
    min-height: 100vh;
    color: var(--white);
    padding: 24px;
    padding-bottom: 100px;
    position: relative;
    background-color: var(--bg);
    background-image:
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
      radial-gradient(circle at 82% 4%, rgba(255,105,31,.12), transparent 23%);
    background-size: 80px 80px, 80px 80px, auto;
  }

  /* Tactical Checkerboard Accent */
  .checker-strip {
    height: 9px;
    width: 100%;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    background: repeating-linear-gradient(135deg, var(--orange) 0 11px, #242528 11px 22px);
    margin-bottom: 24px;
    border: 1px solid var(--line-strong);
  }

  /* ── Header ── */
  .schedule-header {
    max-width: 1400px;
    margin: 0 auto 32px;
    border: 1px solid var(--line-strong);
    background: var(--panel);
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .schedule-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--line-strong);
    background: var(--lime);
    color: var(--ink);
  }

  .tactical-tag {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .schedule-header-main {
    padding: 38px 36px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 24px;
    position: relative;
  }

  .schedule-header-main::before {
    content: "+";
    position: absolute;
    top: -12px;
    left: -12px;
    color: var(--lime);
    font-size: 24px;
    font-weight: 900;
  }
  .schedule-header-main::after {
    content: "+";
    position: absolute;
    bottom: -12px;
    right: -12px;
    color: var(--lime);
    font-size: 24px;
    font-weight: 900;
  }

  .schedule-eyebrow {
    font-family: var(--font-mono);
    color: var(--lime);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2em;
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  .schedule-title {
    font-size: clamp(40px, 8vw, 80px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.04em;
    color: var(--white);
    margin: 0;
    line-height: 0.88;
  }

  .schedule-title span { color: var(--lime); }

  .schedule-subtitle {
    margin: 16px 0 0;
    color: #888;
    font-size: 14px;
    max-width: 480px;
    border-left: 2px solid var(--lime);
    padding-left: 16px;
  }

  .schedule-badge {
    border: 1px solid var(--line-strong);
    border-left: 5px solid var(--orange);
    padding: 10px 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--surface);
  }

  .schedule-badge-label {
    font-size: 10px;
    color: #888;
    letter-spacing: 0.2em;
    font-family: 'JetBrains Mono', monospace;
  }

  .schedule-badge-val {
    color: var(--lime);
    font-size: 20px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }

  /* ── Grid Layout ── */
  .schedule-main {
    max-width: 1400px;
    margin: 0 auto 40px;
    overflow-x: auto;
  }

  .schedule-grid-wrap {
    min-width: 1080px;
    border: 2px solid var(--white);
    background: var(--bg);
  }

  .schedule-grid {
    display: grid;
    grid-template-columns: 80px repeat(10, 1fr);
    gap: 1px;
    background: var(--border); /* Grid lines */
  }

  .schedule-corner, .schedule-time-header, .schedule-day, .schedule-cell {
    background: var(--bg);
  }

  .schedule-corner {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid var(--lime);
    position: sticky;
    left: 0;
    z-index: 30;
  }
  .schedule-corner span {
    font-size: 10px;
    color: #888;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }

  .schedule-time-header {
    padding: 16px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid var(--border);
  }
  .schedule-time-header span {
    color: #AAA;
    font-size: 13px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
  }

  .schedule-day {
    color: var(--white);
    font-weight: 900;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 6px;
    position: sticky;
    left: 0;
    z-index: 20;
    border-right: 2px solid var(--border);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .schedule-cell {
    min-height: 64px;
    position: relative;
  }
  .schedule-cell-dot {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 4px;
    height: 4px;
    background: var(--border);
  }

  /* ── Class Cards (Brutalist) ── */
  .class-card {
    background: var(--gray);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 16px;
    transition: background 0.1s ease-in-out, border-color 0.1s ease-in-out;
    z-index: 10;
    will-change: transform;
  }

  .class-card:hover {
    background: var(--lime);
    border-color: var(--white);
  }

  .class-card-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: var(--lime);
    transition: background 0.1s;
  }

  .class-card:hover .class-card-accent {
    background: var(--bg);
  }

  .class-card-body {
    padding-left: 12px;
  }

  .class-card-code {
    display: inline-block;
    color: var(--lime);
    font-size: 11px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 8px;
    border: 1px solid var(--lime);
    padding: 2px 4px;
  }
  .class-card:hover .class-card-code {
    color: var(--bg);
    border-color: var(--bg);
  }

  .class-card-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--white);
    line-height: 1.3;
    margin: 0 0 8px;
  }
  .class-card:hover .class-card-name {
    color: var(--bg);
  }

  .class-card-detail {
    font-size: 11px;
    color: #888;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .class-card:hover .class-card-detail {
    color: #333;
  }
  .class-card-glyph {
    color: var(--lime);
  }
  .class-card:hover .class-card-glyph {
    color: var(--bg);
  }

  /* ── Mobile List Layout ── */
  .schedule-mobile-list {
    display: none;
    max-width: 640px;
    margin: 0 auto;
    flex-direction: column;
    gap: 24px;
  }

  .mobile-day {
    border: 2px solid var(--white);
    background: var(--bg);
  }

  .mobile-day-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--bg);
    border-bottom: 2px solid var(--lime);
  }

  .mobile-day-idx {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: var(--lime);
    font-size: 14px;
    border: 1px solid var(--lime);
    padding: 4px 8px;
  }

  .mobile-day-title {
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    color: var(--white);
    margin: 0;
    letter-spacing: 0.05em;
  }

  .mobile-day-count {
    margin-left: auto;
    font-size: 11px;
    color: #888;
    font-family: 'JetBrains Mono', monospace;
  }

  .mobile-class {
    padding: 16px;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }
  .mobile-class:last-child {
    border-bottom: 0;
  }

  .mobile-class-code {
    color: var(--lime);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 4px;
    display: block;
  }
  .mobile-class-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--white);
    line-height: 1.4;
    margin: 0 0 4px;
  }
  .mobile-class-detail {
    font-size: 11px;
    color: #888;
    font-family: 'JetBrains Mono', monospace;
  }
  .mobile-class-time {
    font-size: 14px;
    font-weight: 700;
    color: var(--white);
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
    border-left: 2px solid var(--lime);
    padding-left: 8px;
  }

  .mobile-day-empty {
    padding: 24px 16px;
    text-align: center;
    color: #555;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .schedule-root { padding: 12px; padding-bottom: 100px; }
    .schedule-header-main { padding: 20px; flex-direction: column; align-items: flex-start; }
    .schedule-grid-layout { display: none; }
    .schedule-mobile-list { display: flex; }
  }

  @media (prefers-reduced-motion: reduce) {
    .schedule-root, .schedule-root * { cursor: auto !important; }
    .cursor-ink-dot, .cursor-ink-blob-wrapper { display: none !important; }
    .class-card { transition: none; }
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
          <span className="class-card-glyph">▶</span>
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

  // Cursor Refs
  const dotRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  // GSAP Mechanical Brutalist Animation
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".schedule-header",
        { scaleY: 0, opacity: 0, transformOrigin: "top center" },
        { scaleY: 1, opacity: 1, duration: 0.5, ease: "power4.out" },
        0,
      );

      tl.fromTo(
        ".schedule-header > *",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "power4.out" },
        0.2,
      );

      tl.fromTo(
        ".schedule-grid-wrap",
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power4.out" },
        0.4,
      );

      tl.fromTo(
        ".class-card",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: "power4.out",
          clearProps: "transform,opacity",
        },
        0.5,
      );

      tl.fromTo(
        ".mobile-day",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power4.out" },
        0.4,
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Custom Ink Cursor Logic (Desktop Only)
  useEffect(() => {
    const dot = dotRef.current;
    const blob = blobRef.current;
    if (!dot || !blob) return;

    // Center the elements initially
    gsap.set([dot, blob], { xPercent: -50, yPercent: -50 });

    // QuickTo for ultra-smooth, performant trailing animations
    const xToDot = gsap.quickTo(dot, "x", {
      duration: 0.15,
      ease: "power3.out",
    });
    const yToDot = gsap.quickTo(dot, "y", {
      duration: 0.15,
      ease: "power3.out",
    });
    const xToBlob = gsap.quickTo(blob, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const yToBlob = gsap.quickTo(blob, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const move = (e: MouseEvent) => {
      dot.classList.add("visible");
      blob.classList.add("visible");
      blob.classList.toggle(
        "hovering",
        e.target instanceof Element &&
          Boolean(e.target.closest('a, button, .class-card, [role="button"]')),
      );
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToBlob(e.clientX);
      yToBlob(e.clientY);
    };

    const down = () => blob.classList.add("clicking");
    const up = () => blob.classList.remove("clicking");
    const leave = () => {
      dot.classList.remove("visible");
      blob.classList.remove("visible", "hovering", "clicking");
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  // Auto-navigate to current day (Monday-Friday) on mobile view
  useEffect(() => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) {
      const dayId = DAY_IDS[today - 1];
      const timer = setTimeout(() => {
        const el = dayRefs.current[dayId];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveDay(dayId);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
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
      { root: null, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    DAY_IDS.forEach((id) => {
      const el = dayRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToDay = (dayId: string) => {
    const el = dayRefs.current[dayId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveDay(dayId);
    }
  };

  const mobileSchedule = DAYS.map((day, dayIndex) => {
    const row = dayIndex + 2;
    return {
      day: DAY_LABELS[dayIndex],
      dayId: DAY_IDS[dayIndex],
      idx: `0${dayIndex + 1}`,
      classes: CLASSES.filter((c) => c.row === row)
        .sort((a, b) => a.colStart - b.colStart)
        .map((c) => ({
          ...c,
          time: `${TIMES[c.colStart - 2]} - ${TIMES[c.colEnd - 3]}`,
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

      {/* Custom Ink Cursor Elements */}
      <div className="cursor-ink-blob-wrapper" ref={blobRef}>
        <div className="cursor-ink-blob-inner" />
      </div>
      <div className="cursor-ink-dot" ref={dotRef} />

      <div className="checker-strip" />

      {/* ── Header ── */}
      <header className="schedule-header">
        <div className="schedule-header-top">
          <span className="tactical-tag">◆ COURSE CONTROL / 01</span>
          <span className="tactical-tag">STATUS: [ ONLINE ]</span>
        </div>
        <div className="schedule-header-main">
          <div>
            <div className="schedule-eyebrow">
              {"// MY ACADEMIC SCHEDULE"}
            </div>
            <h1 className="schedule-title">
              MY SCHED
              <br />
              ULE<span>.</span>
            </h1>
            <p className="schedule-subtitle">
              ตารางเรียนและแผนการสอบ · วางจังหวะให้พร้อมสำหรับทุกภารกิจ
            </p>
          </div>
          <div className="schedule-badge">
            <span className="schedule-badge-label">[ SEMESTER ]</span>
            <span className="schedule-badge-val">2569 / 1</span>
          </div>
        </div>
      </header>

      {/* ── Desktop / Tablet Grid ── */}
      <main className="schedule-main schedule-grid-layout">
        <div className="schedule-grid-wrap">
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
              <span className="mobile-day-idx">[ {day.idx} ]</span>
              <h2 className="mobile-day-title">{day.day}</h2>
              <span className="mobile-day-count">
                {day.classes.length > 0
                  ? `${day.classes.length} UNITS`
                  : "0 UNITS"}
              </span>
            </div>

            {day.classes.length === 0 ? (
              <div className="mobile-day-empty">REST DAY — NO EXCUSES.</div>
            ) : (
              day.classes.map((cls) => (
                <div
                  className="mobile-class"
                  key={`${cls.code}-${cls.row}-${cls.colStart}`}
                >
                  <div>
                    <span className="mobile-class-code">▶ {cls.code}</span>
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

      <ScheduleBottomNav
        days={navDays}
        activeDay={activeDay}
        onDayClick={scrollToDay}
      />
    </div>
  );
}
