"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import ScheduleBottomNav from "./ScheduleBottomNav";

interface ClassSession {
  name: string;
  code: string;
  detail: string;
  row: number;
  colStart: number;
  colEnd: number;
}

const DAYS = [
  { id: "mon", short: "จ.", label: "MONDAY", index: "01" },
  { id: "tue", short: "อ.", label: "TUESDAY", index: "02" },
  { id: "wed", short: "พ.", label: "WEDNESDAY", index: "03" },
  { id: "thu", short: "พฤ.", label: "THURSDAY", index: "04" },
  { id: "fri", short: "ศ.", label: "FRIDAY", index: "05" },
] as const;

const TIMES = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

const TIME_BOUNDARIES = [...TIMES, "19:00"];

const CLASSES: ClassSession[] = [
  { name: "วิทยาการข้อมูล", code: "10301351", detail: "SEC 2 | LEC | 105", row: 2, colStart: 3, colEnd: 5 },
  { name: "ตรรกศาสตร์เชิงดิจิทัลฯ", code: "10301364", detail: "SEC 1 | LAB | 105", row: 2, colStart: 6, colEnd: 8 },
  { name: "ภาษาอังกฤษเพื่อการศึกษาฯ", code: "10700320", detail: "SEC 2 | LEC | 147", row: 2, colStart: 8, colEnd: 10 },
  { name: "ปัญญาประดิษฐ์", code: "10301371", detail: "SEC 1 | LEC | 141", row: 3, colStart: 3, colEnd: 5 },
  { name: "วิทยาการข้อมูล", code: "10301351", detail: "SEC 2 | LAB | 105", row: 3, colStart: 6, colEnd: 9 },
  { name: "วิทยาศาสตร์เพื่อชีวิต", code: "10300411", detail: "SEC 5 | LEC | 141", row: 3, colStart: 10, colEnd: 12 },
  { name: "ตรรกศาสตร์เชิงดิจิทัลฯ", code: "10301364", detail: "SEC 1 | LAB | 105", row: 5, colStart: 2, colEnd: 5 },
  { name: "การประมวลผลภาษาธรรมชาติ", code: "10301374", detail: "SEC 1 | LEC | 105", row: 5, colStart: 6, colEnd: 8 },
  { name: "ภาษาอังกฤษเพื่อการศึกษาฯ", code: "10700320", detail: "SEC 2 | LEC | 147", row: 5, colStart: 8, colEnd: 10 },
  { name: "การประมวลผลภาษาธรรมชาติ", code: "10301374", detail: "SEC 1 | LAB | 105", row: 6, colStart: 2, colEnd: 5 },
  { name: "ปัญญาประดิษฐ์", code: "10301371", detail: "SEC 1 | LAB | 105", row: 6, colStart: 6, colEnd: 9 },
  { name: "วิทยาศาสตร์เพื่อชีวิต", code: "10300411", detail: "SEC 5 | LEC | 141", row: 6, colStart: 10, colEnd: 12 },
];

const COURSE_TONES: Record<string, string> = {
  "10301351": "acid",
  "10301364": "orange",
  "10700320": "sky",
  "10301371": "violet",
  "10300411": "yellow",
  "10301374": "paper",
};

const CSS = `
  :root {
    --ink: #121310;
    --ink-soft: #1a1b18;
    --ink-raised: #24251f;
    --paper: #f2f0e6;
    --paper-soft: #d9d7cc;
    --acid: #c8ff38;
    --orange: #ff5b22;
    --sky: #75d8ff;
    --violet: #a692ff;
    --yellow: #ffd23f;
    --line: #3b3d36;
    --muted: #96988e;
    --font-display: system-ui, sans-serif;
    --font-thai: var(--font-kanit);
    --font-mono: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
  }

  * { box-sizing: border-box; }
  html { background: var(--ink); scroll-behavior: smooth; }
  body {
    margin: 0;
    background: var(--ink);
    overflow-x: hidden;
    font-family: var(--font-display);
    text-rendering: optimizeLegibility;
  }
  button { font: inherit; }
  .schedule-subtitle,
  .schedule-day strong,
  .class-card-name,
  .mobile-day-short,
  .mobile-class-name {
    font-family: var(--font-thai);
  }
  ::selection { color: var(--ink); background: var(--acid); }
  button:focus-visible, [role="button"]:focus-visible {
    outline: 3px solid var(--paper);
    outline-offset: 3px;
  }

  .schedule-root {
    min-height: 100vh;
    color: var(--paper);
    padding: 18px 22px 112px;
    position: relative;
    isolation: isolate;
    background:
      radial-gradient(circle at 82% -8%, rgba(255, 91, 34, .24), transparent 27%),
      linear-gradient(116deg, transparent 0 49%, rgba(255,255,255,.025) 49% 50%, transparent 50%),
      linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px),
      var(--ink);
    background-size: auto, 230px 230px, 64px 64px, 64px 64px, auto;
  }
  .schedule-root::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: .18;
    background-image: repeating-linear-gradient(112deg, transparent 0 7px, rgba(255,255,255,.035) 7px 8px);
    mask-image: linear-gradient(to bottom, #000, transparent 58%);
  }
  .schedule-root::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: .12;
    background-image: radial-gradient(rgba(242,240,230,.22) .65px, transparent .7px);
    background-size: 5px 5px;
    mix-blend-mode: overlay;
  }
  .content-shell { max-width: 1480px; margin-inline: auto; }

  .signal-rail {
    height: 13px;
    margin-bottom: 14px;
    border: 1px solid #6a6c64;
    background: repeating-linear-gradient(-45deg, var(--orange) 0 14px, var(--orange) 14px 18px, var(--ink) 18px 32px);
    position: relative;
  }
  .signal-rail::after {
    content: "WEEK 01 / ACTIVE ROUTE";
    position: absolute;
    right: 18px;
    top: -1px;
    height: 13px;
    padding-inline: 12px;
    color: var(--ink);
    background: var(--paper);
    font: 900 8px/13px var(--font-mono);
    letter-spacing: .12em;
  }

  .schedule-header {
    margin-bottom: 22px;
    border: 2px solid #6d6f66;
    background:
      linear-gradient(90deg, rgba(255,255,255,.026) 1px, transparent 1px),
      var(--ink-soft);
    background-size: 34px 34px;
    box-shadow: 12px 12px 0 rgba(0,0,0,.3);
    position: relative;
    overflow: hidden;
  }
  .schedule-header::after {
    content: "01";
    position: absolute;
    right: -18px;
    bottom: -78px;
    color: transparent;
    -webkit-text-stroke: 1px rgba(242,240,230,.13);
    font: 950 clamp(190px, 25vw, 390px)/1 var(--font-display);
    letter-spacing: -.11em;
    pointer-events: none;
  }
  .schedule-header-top {
    min-height: 42px;
    padding: 9px 16px;
    color: var(--ink);
    background: var(--acid);
    border-bottom: 2px solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    position: relative;
    z-index: 2;
  }
  .schedule-header-top::before {
    content: "";
    width: 11px;
    height: 11px;
    flex: none;
    background: var(--ink);
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }
  .system-label {
    font: 900 10px/1.2 var(--font-mono);
    letter-spacing: .14em;
    white-space: nowrap;
  }
  .header-status { margin-left: auto; display: flex; align-items: center; gap: 9px; }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ink);
    box-shadow: 0 0 0 3px rgba(18,19,16,.16);
  }

  .schedule-header-main {
    min-height: 370px;
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(330px, .62fr);
    position: relative;
    z-index: 1;
  }
  .hero-copy {
    padding: clamp(30px, 4vw, 58px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: visible;
  }
  .hero-copy::before, .hero-copy::after {
    content: "+";
    position: absolute;
    color: var(--acid);
    font: 700 23px/1 var(--font-mono);
  }
  .hero-copy::before { left: -11px; top: 22px; }
  .hero-copy::after { right: -11px; bottom: 22px; }
  .hero-document-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 19px;
  }
  .hero-sticker {
    padding: 7px 10px 6px;
    color: var(--ink);
    background: var(--paper);
    box-shadow: 3px 3px 0 var(--orange);
    clip-path: polygon(0 0, 95% 0, 100% 30%, 96% 100%, 0 100%, 3% 52%);
    font: 900 9px/1 var(--font-mono);
    letter-spacing: .13em;
    transform: rotate(-2deg);
  }
  .schedule-eyebrow {
    margin: 0;
    color: var(--acid);
    font: 900 11px/1 var(--font-mono);
    letter-spacing: .2em;
    text-transform: uppercase;
  }
  .schedule-title {
    max-width: 850px;
    margin: 0;
    color: var(--paper);
    font-size: clamp(68px, 9.1vw, 146px);
    font-weight: 950;
    letter-spacing: -.075em;
    line-height: .72;
    text-transform: uppercase;
  }
  .schedule-title .title-line { display: block; }
  .schedule-title .title-slash { color: var(--orange); font-weight: 500; margin-right: .04em; }
  .schedule-title .title-accent { color: var(--acid); }
  .schedule-subtitle {
    max-width: 560px;
    margin: 28px 0 0;
    padding: 10px 0 10px 16px;
    border-left: 5px solid var(--orange);
    color: #c0c1b8;
    font-size: 14px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }
  .hero-print-line {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 21px;
    color: #878980;
    font: 900 8px/1 var(--font-mono);
    letter-spacing: .13em;
  }
  .hero-barcode,
  .class-card-barcode {
    display: inline-block;
    flex: none;
    background: repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 8px, currentColor 8px 12px, transparent 12px 14px);
  }
  .hero-barcode { width: 86px; height: 15px; color: var(--paper); opacity: .75; }
  .hero-burst {
    width: 70px;
    height: 70px;
    display: grid;
    place-items: center;
    position: absolute;
    top: 58px;
    right: -35px;
    z-index: 5;
    color: var(--ink);
    background: var(--acid);
    clip-path: polygon(50% 0%, 62% 22%, 82% 9%, 79% 32%, 100% 35%, 81% 49%, 96% 67%, 74% 65%, 72% 91%, 55% 75%, 40% 100%, 34% 76%, 11% 87%, 22% 65%, 0 59%, 20% 46%, 4% 25%, 29% 30%, 32% 5%);
    font: 950 17px/.9 var(--font-display);
    letter-spacing: -.06em;
    transform: rotate(13deg);
  }

  .hero-dashboard {
    min-width: 0;
    padding: 24px;
    border-left: 2px solid var(--ink);
    background: linear-gradient(145deg, rgba(255,255,255,.08), transparent 42%), var(--orange);
    color: var(--ink);
    display: grid;
    grid-template-rows: auto 1fr auto;
    position: relative;
    overflow: hidden;
  }
  .hero-dashboard::before {
    content: "";
    position: absolute;
    width: 230px;
    height: 230px;
    right: -98px;
    top: 42px;
    border: 36px solid rgba(18,19,16,.13);
    border-radius: 50%;
  }
  .hero-dashboard::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(rgba(18,19,16,.25) 1.2px, transparent 1.2px);
    background-size: 7px 7px;
    clip-path: polygon(46% 0, 100% 0, 100% 100%, 72% 100%);
  }
  .dashboard-mark {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font: 900 10px/1 var(--font-mono);
    letter-spacing: .14em;
    position: relative;
    z-index: 1;
  }
  .dashboard-stamp {
    position: absolute;
    top: 72px;
    right: 22px;
    z-index: 2;
    padding: 7px 8px;
    color: var(--ink);
    border: 2px solid var(--ink);
    font: 900 8px/1.35 var(--font-mono);
    letter-spacing: .09em;
    text-align: center;
    transform: rotate(4deg);
  }
  .dashboard-mark strong {
    width: 48px;
    height: 32px;
    display: grid;
    place-items: center;
    color: var(--paper);
    background: var(--ink);
    transform: skewX(-12deg);
  }
  .session-count { align-self: center; position: relative; z-index: 1; }
  .session-count strong {
    display: block;
    font: 950 clamp(92px, 10vw, 160px)/.72 var(--font-display);
    letter-spacing: -.1em;
  }
  .session-count span {
    display: inline-block;
    margin-top: 18px;
    padding: 6px 9px;
    border: 2px solid var(--ink);
    font: 900 10px/1 var(--font-mono);
    letter-spacing: .16em;
  }
  .dashboard-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    border: 1px solid var(--ink);
    background: var(--ink);
    position: relative;
    z-index: 1;
  }
  .dashboard-stat { padding: 14px; background: var(--paper); }
  .dashboard-stat span {
    display: block;
    margin-bottom: 6px;
    font: 800 8px/1 var(--font-mono);
    letter-spacing: .13em;
  }
  .dashboard-stat strong { font-size: 22px; line-height: 1; }

  .schedule-board {
    border: 2px solid #6d6f66;
    background: var(--ink-soft);
    box-shadow: 10px 10px 0 rgba(0,0,0,.22);
    overflow: hidden;
  }
  .board-heading {
    min-height: 90px;
    padding: 18px 24px;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 18px;
    color: var(--ink);
    background: var(--paper);
    border-bottom: 2px solid var(--ink);
    position: relative;
  }
  .board-index {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    color: var(--paper);
    background: var(--ink);
    font: 900 13px/1 var(--font-mono);
    transform: rotate(-3deg);
  }
  .board-title { margin: 0; font-size: clamp(26px, 3vw, 44px); line-height: .95; letter-spacing: -.045em; }
  .board-title span { color: var(--orange); }
  .board-stamp {
    padding: 8px 10px;
    color: var(--paper);
    background: var(--ink);
    font: 900 8px/1.35 var(--font-mono);
    letter-spacing: .12em;
    text-align: center;
    transform: rotate(2deg);
  }
  .board-note {
    max-width: 260px;
    color: #66675f;
    text-align: right;
    font: 800 9px/1.6 var(--font-mono);
    letter-spacing: .08em;
  }
  .board-legend {
    min-height: 41px;
    padding: 9px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    color: #babcb2;
    background: #151613;
    border-top: 1px solid #5f615a;
    font: 800 8px/1.2 var(--font-mono);
    letter-spacing: .08em;
  }
  .board-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .legend-mark { width: 9px; height: 9px; display: inline-block; border: 1px solid var(--paper); transform: rotate(45deg); }
  .legend-mark.signal { background: var(--orange); border-color: var(--orange); }
  .legend-mark.paper { background: var(--paper); }

  .schedule-main { overflow-x: auto; scrollbar-color: var(--orange) var(--ink); }
  .schedule-grid-wrap { min-width: 1160px; padding: 12px; background: var(--ink-soft); }
  .schedule-grid {
    display: grid;
    grid-template-columns: 88px repeat(10, minmax(95px, 1fr));
    grid-template-rows: 54px repeat(5, minmax(112px, auto));
    gap: 1px;
    background: var(--line);
    border: 1px solid #5f615a;
  }
  .schedule-corner, .schedule-time-header, .schedule-day, .schedule-cell { background: var(--ink); }
  .schedule-corner {
    display: grid;
    place-items: center;
    position: sticky;
    left: 0;
    z-index: 30;
    color: var(--acid);
    font: 900 8px/1.3 var(--font-mono);
    letter-spacing: .08em;
    text-align: center;
  }
  .schedule-time-header {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b9bbb1;
    font: 800 11px/1 var(--font-mono);
    font-variant-numeric: tabular-nums;
    position: relative;
  }
  .schedule-time-header::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 1px;
    height: 8px;
    background: var(--orange);
  }
  .schedule-day {
    padding: 10px 6px;
    position: sticky;
    left: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-right: 3px solid var(--acid);
  }
  .schedule-day strong { color: var(--paper); font-size: 19px; line-height: 1; }
  .schedule-day span { color: #73756e; font: 800 8px/1 var(--font-mono); letter-spacing: .1em; }
  .schedule-cell { min-height: 112px; position: relative; }
  .schedule-cell::after {
    content: "";
    position: absolute;
    width: 3px;
    height: 3px;
    right: 8px;
    bottom: 8px;
    background: #3b3d36;
  }

  .class-card {
    min-width: 0;
    margin: 5px;
    padding: 13px 14px 12px;
    color: var(--ink);
    background:
      linear-gradient(115deg, transparent 0 58%, rgba(18,19,16,.055) 58% 59%, transparent 59%),
      var(--course, var(--paper));
    border: 2px solid var(--ink);
    box-shadow: 5px 5px 0 rgba(0,0,0,.42);
    position: relative;
    overflow: hidden;
    z-index: 10;
    transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
    will-change: transform;
  }
  .class-card[data-tone="acid"] { --course: var(--acid); }
  .class-card[data-tone="orange"] { --course: var(--orange); }
  .class-card[data-tone="sky"] { --course: var(--sky); }
  .class-card[data-tone="violet"] { --course: var(--violet); }
  .class-card[data-tone="yellow"] { --course: var(--yellow); }
  .class-card[data-tone="paper"] { --course: var(--paper); }
  .class-card::before {
    content: attr(data-index);
    position: absolute;
    right: -4px;
    bottom: -17px;
    color: rgba(18,19,16,.1);
    font: 950 68px/1 var(--font-display);
    letter-spacing: -.08em;
  }
  .class-card::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    border-style: solid;
    border-width: 0 22px 22px 0;
    border-color: transparent var(--ink) transparent transparent;
  }
  .class-card:hover {
    transform: translate(-2px, -3px) rotate(-.35deg);
    box-shadow: 8px 9px 0 rgba(0,0,0,.52);
    filter: saturate(1.08) brightness(1.03);
  }
  .class-card-top {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 9px;
    position: relative;
    z-index: 1;
  }
  .class-card-pip { width: 6px; height: 6px; background: var(--ink); transform: rotate(45deg); }
  .class-card-code { font: 900 9px/1 var(--font-mono); letter-spacing: .045em; }
  .class-card-time {
    margin-left: auto;
    padding: 4px 5px;
    color: var(--paper);
    background: var(--ink);
    font: 900 7px/1 var(--font-mono);
    letter-spacing: .03em;
    font-variant-numeric: tabular-nums;
  }
  .class-card-name {
    max-width: 95%;
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 900;
    line-height: 1.25;
    position: relative;
    z-index: 1;
  }
  .class-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    position: relative;
    z-index: 1;
  }
  .class-card-meta span {
    padding: 3px 5px;
    color: var(--paper);
    background: var(--ink);
    font: 800 7px/1 var(--font-mono);
    letter-spacing: .06em;
  }
  .class-card-barcode {
    width: 48px;
    height: 6px;
    position: absolute;
    right: 13px;
    bottom: 13px;
    color: var(--ink);
    opacity: .58;
  }

  .schedule-mobile-list { display: none; }
  .mobile-day {
    scroll-margin-top: 18px;
    border: 2px solid #6d6f66;
    background: var(--ink-soft);
    box-shadow: 6px 6px 0 rgba(0,0,0,.24);
    overflow: hidden;
  }
  .mobile-day-header {
    min-height: 64px;
    padding: 12px 14px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    color: var(--ink);
    background: var(--paper);
    position: relative;
    overflow: hidden;
  }
  .mobile-day-header::after {
    content: "";
    position: absolute;
    right: -18px;
    top: 0;
    width: 96px;
    height: 100%;
    opacity: .15;
    background: repeating-linear-gradient(-45deg, var(--orange) 0 8px, transparent 8px 16px);
  }
  .mobile-day-idx {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    color: var(--paper);
    background: var(--ink);
    font: 900 10px/1 var(--font-mono);
    position: relative;
    z-index: 1;
  }
  .mobile-day-title { margin: 0; font-size: 21px; font-weight: 950; letter-spacing: -.035em; position: relative; z-index: 1; }
  .mobile-day-short { color: var(--orange); margin-left: 5px; }
  .mobile-day-count { font: 900 8px/1 var(--font-mono); letter-spacing: .08em; position: relative; z-index: 1; }
  .mobile-class {
    --course: var(--paper);
    min-height: 122px;
    padding: 15px;
    color: var(--ink);
    background:
      linear-gradient(115deg, transparent 0 65%, rgba(18,19,16,.055) 65% 66%, transparent 66%),
      var(--course);
    border-top: 2px solid var(--ink);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    overflow: hidden;
  }
  .mobile-class[data-tone="acid"] { --course: var(--acid); }
  .mobile-class[data-tone="orange"] { --course: var(--orange); }
  .mobile-class[data-tone="sky"] { --course: var(--sky); }
  .mobile-class[data-tone="violet"] { --course: var(--violet); }
  .mobile-class[data-tone="yellow"] { --course: var(--yellow); }
  .mobile-class[data-tone="paper"] { --course: var(--paper); }
  .mobile-class::after {
    content: attr(data-index);
    position: absolute;
    right: 4px;
    bottom: -24px;
    color: rgba(18,19,16,.09);
    font: 950 82px/1 var(--font-display);
  }
  .mobile-class::before {
    content: "";
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 14px;
    width: 5px;
    background: var(--ink);
    opacity: .9;
  }
  .mobile-class-main { min-width: 0; padding-right: 92px; padding-left: 8px; position: relative; z-index: 1; }
  .mobile-class-code {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 8px;
    font: 900 9px/1 var(--font-mono);
    letter-spacing: .06em;
  }
  .mobile-class-code::before { content: ""; width: 6px; height: 6px; background: var(--ink); transform: rotate(45deg); }
  .mobile-class-name { margin: 0 0 11px; font-size: 17px; line-height: 1.3; }
  .mobile-class-detail { margin: 0; font: 800 8px/1 var(--font-mono); letter-spacing: .06em; }
  .mobile-class-time {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 8px 9px;
    color: var(--paper);
    background: var(--ink);
    box-shadow: 3px 3px 0 rgba(255,255,255,.32);
    font: 900 10px/1 var(--font-mono);
    font-variant-numeric: tabular-nums;
    z-index: 1;
  }
  .mobile-day-empty {
    padding: 30px 18px;
    border-top: 1px solid var(--line);
    color: #74766e;
    text-align: center;
    font: 800 9px/1.5 var(--font-mono);
    letter-spacing: .14em;
  }

  .schedule-footer {
    max-width: 1480px;
    margin: 28px auto 0;
    padding: 14px 0;
    border-top: 1px solid #44463f;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    color: #777970;
    font: 800 8px/1.4 var(--font-mono);
    letter-spacing: .12em;
  }

  .cursor-dot, .cursor-ring {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    pointer-events: none;
    display: none;
    opacity: 0;
  }
  @media (hover: hover) and (pointer: fine) {
    .schedule-root, .schedule-root * { cursor: none !important; }
    .cursor-dot, .cursor-ring { display: block; }
    .cursor-dot.visible, .cursor-ring.visible { opacity: 1; }
    .cursor-dot { width: 7px; height: 7px; background: var(--acid); transform: rotate(45deg); }
    .cursor-ring {
      width: 34px;
      height: 34px;
      border: 1px solid rgba(242,240,230,.8);
      transition: width .22s ease, height .22s ease, border-color .22s ease, background .22s ease;
    }
    .cursor-ring.hovering { width: 54px; height: 54px; border-color: var(--orange); background: rgba(255,91,34,.1); }
    .cursor-ring.clicking { width: 24px; height: 24px; background: rgba(200,255,56,.2); }
  }

  @media (max-width: 980px) {
    .schedule-header-main { grid-template-columns: minmax(0, 1fr) 290px; }
    .hero-copy { padding-inline: 32px; }
    .schedule-title { font-size: clamp(66px, 10.8vw, 108px); }
    .hero-dashboard { padding: 18px; }
    .session-count strong { font-size: 92px; }
    .board-heading { grid-template-columns: auto 1fr auto; }
    .board-stamp { display: none; }
  }
  @media (max-width: 768px) {
    .schedule-root { width: 100%; max-width: 100vw; padding: 10px 10px 108px; overflow: hidden; background-size: auto, 150px 150px, 38px 38px, 38px 38px, auto; }
    .content-shell, .schedule-header, .schedule-board, .schedule-mobile-list, .mobile-day, .mobile-class { width: 100%; max-width: 100%; min-width: 0; }
    .signal-rail { height: 10px; margin-bottom: 10px; }
    .signal-rail::after { display: none; }
    .schedule-header { margin-bottom: 14px; box-shadow: 7px 7px 0 rgba(0,0,0,.28); }
    .schedule-header-top { min-height: 38px; padding: 8px 11px; gap: 9px; }
    .schedule-header-top::before { width: 8px; height: 8px; }
    .system-label { font-size: 8px; letter-spacing: .1em; }
    .header-status { gap: 6px; }
    .header-status::before { content: "ONLINE"; font: 900 8px/1 var(--font-mono); letter-spacing: .08em; }
    .header-status .system-label { display: none; }
    .schedule-header-main { min-height: 0; grid-template-columns: 1fr; }
    .hero-copy { min-height: 318px; padding: 30px 20px 34px; }
    .hero-document-line { gap: 8px; margin-bottom: 17px; }
    .hero-sticker { padding: 6px 8px; font-size: 8px; }
    .schedule-eyebrow { font-size: 9px; }
    .schedule-title { font-size: clamp(61px, 20.5vw, 82px); line-height: .75; }
    .schedule-subtitle { margin-top: 24px; padding-block: 5px; font-size: 12px; line-height: 1.55; }
    .hero-print-line { margin-top: 17px; font-size: 7px; }
    .hero-barcode { width: 66px; height: 12px; }
    .hero-burst { width: 54px; height: 54px; right: 5px; top: 83px; font-size: 13px; }
    .hero-dashboard {
      min-height: 142px;
      padding: 16px;
      border-left: 0;
      border-top: 1px solid var(--ink);
      grid-template-columns: auto 1fr;
      grid-template-rows: auto 1fr;
      gap: 8px 18px;
    }
    .dashboard-mark { grid-column: 1 / -1; }
    .dashboard-stamp { display: none; }
    .session-count { display: flex; align-items: center; gap: 12px; }
    .session-count strong { font-size: 70px; }
    .session-count span { margin: 0; max-width: 70px; line-height: 1.35; }
    .dashboard-stats { align-self: center; }
    .dashboard-stat { padding: 10px; }
    .dashboard-stat strong { font-size: 18px; }
    .schedule-board { border: 0; background: transparent; box-shadow: none; overflow: visible; }
    .board-heading { min-height: 74px; padding: 12px 10px; margin-bottom: 10px; border: 1px solid #5a5c55; }
    .board-index { width: 40px; height: 40px; }
    .board-title { font-size: 25px; }
    .board-note { display: none; }
    .board-stamp { display: none; }
    .schedule-main { display: none; }
    .board-legend { display: none; }
    .schedule-mobile-list { display: flex; flex-direction: column; align-items: stretch; gap: 12px; }
    .mobile-day-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mobile-class-name { overflow-wrap: anywhere; }
    .schedule-footer { margin-top: 20px; padding-inline: 2px; font-size: 7px; }
  }
  @media (max-width: 420px) {
    .schedule-title { font-size: clamp(58px, 19vw, 76px); }
    .hero-copy { min-height: 300px; }
    .mobile-day-count { display: none; }
    .mobile-day-header { grid-template-columns: auto minmax(0, 1fr); }
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .schedule-root, .schedule-root * { cursor: auto !important; }
    .cursor-dot, .cursor-ring { display: none !important; }
    .class-card { transition: none; }
  }
`;

function splitMeta(detail: string) {
  return detail.split("|").map((part) => part.trim());
}

function getSessionTime(session: ClassSession) {
  const start = TIME_BOUNDARIES[session.colStart - 2];
  const end = TIME_BOUNDARIES[session.colEnd - 2];
  return `${start}–${end}`;
}

function ClassCard({ session, index }: { session: ClassSession; index: number }) {
  return (
    <article
      className="class-card"
      data-tone={COURSE_TONES[session.code]}
      data-index={String(index + 1).padStart(2, "0")}
      style={{ gridRowStart: session.row, gridColumnStart: session.colStart, gridColumnEnd: session.colEnd }}
      aria-label={`${session.name} ${getSessionTime(session)}`}
    >
      <div className="class-card-top">
        <span className="class-card-pip" aria-hidden="true" />
        <span className="class-card-code">{session.code}</span>
        <span className="class-card-time">{getSessionTime(session)}</span>
      </div>
      <h3 className="class-card-name">{session.name}</h3>
      <div className="class-card-meta">
        {splitMeta(session.detail).map((item) => <span key={item}>{item}</span>)}
      </div>
      <span className="class-card-barcode" aria-hidden="true" />
    </article>
  );
}

export default function Schedule() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const programmaticScrollRef = useRef<string | null>(null);
  const scrollUnlockTimerRef = useRef<number | null>(null);
  const [activeDay, setActiveDay] = useState("mon");

  const mobileSchedule = useMemo(
    () => DAYS.map((day, dayIndex) => ({
      ...day,
      classes: CLASSES.filter((session) => session.row === dayIndex + 2)
        .sort((a, b) => a.colStart - b.colStart)
        .map((session) => ({ ...session, time: getSessionTime(session) })),
    })),
    [],
  );
  const uniqueCourses = useMemo(() => new Set(CLASSES.map((session) => session.code)).size, []);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
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
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dotX = gsap.quickTo(dot, "x", { duration: .08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: .08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: .32, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: .32, ease: "power3.out" });
    const handleMove = (event: MouseEvent) => {
      dot.classList.add("visible");
      ring.classList.add("visible");
      ring.classList.toggle("hovering", event.target instanceof Element && Boolean(event.target.closest("button, .class-card")));
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
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  useEffect(() => {
    let isDisposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isDisposed || programmaticScrollRef.current) return;
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) setActiveDay(visibleEntry.target.id.replace("day-", ""));
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );
    DAYS.forEach(({ id }) => {
      const element = dayRefs.current[id];
      if (element) observer.observe(element);
    });
    return () => {
      isDisposed = true;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const releaseProgrammaticScroll = () => {
      if (!programmaticScrollRef.current) return;
      programmaticScrollRef.current = null;
      if (scrollUnlockTimerRef.current !== null) {
        window.clearTimeout(scrollUnlockTimerRef.current);
        scrollUnlockTimerRef.current = null;
      }
    };

    window.addEventListener("scrollend", releaseProgrammaticScroll);
    return () => {
      window.removeEventListener("scrollend", releaseProgrammaticScroll);
      if (scrollUnlockTimerRef.current !== null) {
        window.clearTimeout(scrollUnlockTimerRef.current);
      }
    };
  }, []);

  const scrollToDay = (dayId: string) => {
    const target = dayRefs.current[dayId];
    if (!target) return;

    programmaticScrollRef.current = dayId;
    setActiveDay(dayId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (scrollUnlockTimerRef.current !== null) {
      window.clearTimeout(scrollUnlockTimerRef.current);
    }
    scrollUnlockTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = null;
      scrollUnlockTimerRef.current = null;
    }, 1200);
  };

  return (
    <div className="schedule-root" ref={rootRef}>
      <style>{CSS}</style>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />

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
                <span className="title-line"><span className="title-slash">/</span>GRID<span className="title-accent">.</span></span>
              </h1>
              <p className="schedule-subtitle">
                ตารางเรียนและแผนการสอบที่จัดทุกวิชา เวลา และห้องเรียนให้เห็นชัดในจังหวะเดียว
              </p>
              <div className="hero-print-line">
                <span className="hero-barcode" aria-hidden="true" />
                <span>WEEKLY ROUTE / CAMPUS ISSUE</span>
              </div>
              <span className="hero-burst" aria-hidden="true">GO!</span>
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

        <section className="schedule-board" aria-labelledby="weekly-grid-title">
          <div className="board-heading">
            <span className="board-index">02</span>
            <h2 className="board-title" id="weekly-grid-title">WEEKLY <span>ROUTING</span></h2>
            <span className="board-stamp">ROUTE SHEET<br />V1.0</span>
            <span className="board-note">MON—FRI / 09:00—19:00<br />ALL TIMES ICT (UTC+7)</span>
          </div>

          <div className="schedule-main">
            <div className="schedule-grid-wrap">
              <div className="schedule-grid">
                <div className="schedule-corner">DAY<br />TIME</div>
                {TIMES.map((time) => <div className="schedule-time-header" key={time}>{time}</div>)}
                {DAYS.map((day, rowIndex) => (
                  <React.Fragment key={day.id}>
                    <div className="schedule-day" style={{ gridRowStart: rowIndex + 2, gridColumnStart: 1 }}>
                      <strong>{day.short}</strong><span>{day.label.slice(0, 3)}</span>
                    </div>
                    {TIMES.map((time, columnIndex) => (
                      <div
                        className="schedule-cell"
                        key={`${day.id}-${time}`}
                        style={{ gridRowStart: rowIndex + 2, gridColumnStart: columnIndex + 2 }}
                      />
                    ))}
                  </React.Fragment>
                ))}
                {CLASSES.map((session, index) => (
                  <ClassCard session={session} index={index} key={`${session.code}-${session.row}-${session.colStart}`} />
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
              <div
                className="mobile-day"
                id={`day-${day.id}`}
                key={day.id}
                ref={(element) => { dayRefs.current[day.id] = element; }}
              >
                <div className="mobile-day-header">
                  <span className="mobile-day-idx">{day.index}</span>
                  <h3 className="mobile-day-title">{day.label}<span className="mobile-day-short">/{day.short}</span></h3>
                  <span className="mobile-day-count">{day.classes.length} SLOT</span>
                </div>
                {day.classes.length === 0 ? (
                  <div className="mobile-day-empty">OPEN DAY / NO CLASS ROUTE</div>
                ) : (
                  day.classes.map((session) => {
                    const sessionIndex = CLASSES.findIndex(
                      (item) => item.code === session.code && item.row === session.row && item.colStart === session.colStart,
                    );
                    return (
                      <article
                        className="mobile-class"
                        data-tone={COURSE_TONES[session.code]}
                        data-index={String(sessionIndex + 1).padStart(2, "0")}
                        key={`${session.code}-${session.row}-${session.colStart}`}
                      >
                        <div className="mobile-class-main">
                          <span className="mobile-class-code">{session.code}</span>
                          <h4 className="mobile-class-name">{session.name}</h4>
                          <p className="mobile-class-detail">{session.detail}</p>
                        </div>
                        <time className="mobile-class-time">{session.time}</time>
                      </article>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="schedule-footer">
        <span>MY SCHEDULE / ACADEMIC CONTROL</span>
        <span>TERM 01 · 2569</span>
      </footer>
      <ScheduleBottomNav
        days={DAYS.map(({ id, label }) => ({ id, label: label.slice(0, id === "thu" ? 2 : 1) }))}
        activeDay={activeDay}
        onDayClick={scrollToDay}
      />
    </div>
  );
}
