"use client";

import type { CSSProperties } from "react";
import { COURSE_TONES, type ClassSession } from "./schedule-data";
import { durationHours } from "./schedule-time";

export type TypeFilter = "ALL" | "LEC" | "LAB";

export default function ClassCard({
  session,
  index,
  isNow,
  filter,
  style,
  onOpen,
}: {
  session: ClassSession;
  index: number;
  isNow: boolean;
  filter: TypeFilter;
  style?: CSSProperties;
  onOpen: (code: string, trigger: HTMLElement) => void;
}) {
  const dimmed = filter !== "ALL" && session.type !== filter;
  const short = durationHours(session) < 2;
  const className = ["class-card", short && "is-short", isNow && "is-now", dimmed && "is-dim"]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      style={{ ...style, "--tone": `var(--tone-${COURSE_TONES[session.code]})`, "--i": index } as CSSProperties}
      onClick={(e) => onOpen(session.code, e.currentTarget)}
      tabIndex={dimmed ? -1 : 0}
      aria-hidden={dimmed || undefined}
      aria-label={`${session.name} ${session.start} ถึง ${session.end} ห้อง ${session.room} กลุ่ม ${session.section} ${session.type}${isNow ? " กำลังเรียน" : ""}`}
    >
      <span className={`chip${session.type === "LAB" ? " chip-lab" : ""}`}>{session.type}</span>
      <span className="card-time">
        {session.start}–{session.end}
      </span>
      <span className="card-name">{session.name}</span>
      <span className="card-meta">
        <span>{session.room}</span> <span>SEC {session.section}</span> <span>{session.code}</span>
      </span>
    </button>
  );
}
