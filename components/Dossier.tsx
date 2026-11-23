"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { EncryptedText } from "./ui/encrypted-text";
import { DECODE } from "./motion-presets";
import { CLASSES, COURSE_TONES, DAYS } from "./schedule-data";
import { durationHours } from "./schedule-time";

// Barcode bar widths derived from the course code digits (decorative).
function barcode(code: string) {
  return [...code, ...code].flatMap((ch, i) => [
    <i key={`b${i}`} style={{ width: 1 + (Number(ch) % 4) }} />,
    <i key={`g${i}`} className="gap" style={{ width: 1 + ((Number(ch) + 2) % 3) }} />,
  ]);
}

export default function Dossier({
  code,
  open,
  onClose,
}: {
  /** Last opened course; kept after close so the drawer can slide out with content. */
  code: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sessions = code ? CLASSES.filter((s) => s.code === code) : [];
  const course = sessions[0];

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? " is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`dossier${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-name"
        inert={!open}
      >
        <div className="dossier-holes" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <button ref={closeRef} type="button" className="dossier-close" onClick={onClose} aria-label="ปิด">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M4.5 4.5l11 11M15.5 4.5l-11 11" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        </button>
        {course && (
          <>
            <div className="dossier-code">
              <EncryptedText key={course.code} text={`COURSE FILE · ${course.code}`} {...DECODE.stamp} />
            </div>
            <div className="dossier-bars" aria-hidden="true">
              {barcode(course.code)}
            </div>
            <div
              className="dossier-kicker"
              style={{ "--tone": `var(--tone-${COURSE_TONES[course.code]})` } as CSSProperties}
            >
              <i aria-hidden="true" />
              DOSSIER
            </div>
            <h2 id="dossier-name" className="dossier-name">
              {course.name}
            </h2>
            <dl className="dossier-grid">
              <div>
                <dt>CODE</dt>
                <dd>{course.code}</dd>
              </div>
              <div>
                <dt>SECTION</dt>
                <dd>{[...new Set(sessions.map((s) => s.section))].join(", ")}</dd>
              </div>
              <div>
                <dt>ROOM</dt>
                <dd>{[...new Set(sessions.map((s) => s.room))].join(", ")}</dd>
              </div>
              <div>
                <dt>HOURS / WEEK</dt>
                <dd>{sessions.reduce((sum, s) => sum + durationHours(s), 0)} ชม.</dd>
              </div>
            </dl>
            <h3 className="dossier-sub">SESSIONS &gt;&gt;</h3>
            <ul className="dossier-sessions">
              {sessions.map((s) => (
                <li key={`${s.day}-${s.start}`}>
                  <b>{DAYS.find((d) => d.id === s.day)!.label.slice(0, 3)}</b>
                  <div>
                    <span>
                      {s.start}–{s.end}
                    </span>
                    <small>{s.room}</small>
                  </div>
                  <em>{s.type}</em>
                </li>
              ))}
            </ul>
            <p className="dossier-foot">
              SOURCE: components/schedule-data.ts
              <br />
              NOT AN OFFICIAL REGISTRATION RECORD
            </p>
          </>
        )}
      </aside>
    </>
  );
}
