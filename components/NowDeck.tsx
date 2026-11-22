"use client";

import type { CSSProperties } from "react";
import { COURSE_TONES, DAYS, type ClassSession } from "./schedule-data";
import { formatSpan, toMinutes, type NowState } from "./schedule-time";

const dayShort = (s: ClassSession) => DAYS.find((d) => d.id === s.day)!.label.slice(0, 3);

export default function NowDeck({
  now,
  courses,
  onOpen,
}: {
  now: NowState | null;
  courses: ClassSession[];
  onOpen: (code: string, trigger: HTMLElement) => void;
}) {
  const current = now?.current ?? null;
  let progress = 0;
  let left = 0;
  let elapsed = 0;
  let total = 0;
  if (now && current) {
    const start = toMinutes(current.start);
    const end = toMinutes(current.end);
    total = end - start;
    elapsed = Math.min(total, Math.max(0, now.minutes - start));
    progress = (elapsed / total) * 100;
    left = end - now.minutes;
  }
  const next = now?.upcoming[0];

  return (
    <aside className="deck" aria-label="สถานะตอนนี้">
      <section className="vhs" aria-labelledby="now-tag" aria-live="polite">
        <div className="vhs-spine" aria-hidden="true">
          <span>NOW PLAYING // SIDE A</span>
        </div>
        <div className="vhs-label">
          <span id="now-tag" className={`tape${current ? "" : " tape-ghost"}`}>
            {now ? (current ? "NOW" : "FREE") : "SYNC"}
          </span>
          <span className="rec">
            <i aria-hidden="true" />
            REC
          </span>
        </div>

        {!now && <div className="now-time">--:--</div>}

        {now && current && (
          <>
            <div className="now-time">
              {current.start}–{current.end}
            </div>
            <p className="now-name">{current.name}</p>
            <div className="now-meta">
              ROOM <b>{current.room}</b>
              <br />
              SEC <b>{current.section}</b> · {current.type} · {current.code}
            </div>
            <div className="gauge">
              <div className="gauge-row">
                <span>PROGRESS</span>
                <b>{formatSpan(left)} LEFT</b>
              </div>
              <div className="gauge-track-row">
                <span className="gauge-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
                    <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
                  </svg>
                </span>
                <div
                  className="gauge-bar"
                  role="progressbar"
                  aria-label="ความคืบหน้าคาบนี้"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={elapsed}
                  aria-valuetext={`ผ่านไป ${elapsed} จาก ${total} นาที`}
                >
                  {progress > 0 && (
                    <i style={{ width: `${progress}%`, "--frac": Math.max(progress, 1) / 100 } as CSSProperties} />
                  )}
                  <span className="gauge-label" aria-hidden="true">
                    {elapsed} / {total}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {now && !current && (
          <>
            <div className="now-time">--:--</div>
            <div className="now-empty">
              <span>ตอนนี้ไม่มีคาบเรียน</span>
            </div>
            {next && now.minutesToNext !== null && (
              <div className="gauge">
                <div className="gauge-row">
                  <span>NEXT IN</span>
                  <b>{formatSpan(now.minutesToNext)}</b>
                </div>
                <div className="now-meta">
                  &gt;&gt;{" "}
                  <b>
                    {dayShort(next)} {next.start}
                  </b>{" "}
                  {next.name}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="panel" aria-labelledby="queue-h">
        <div className="panel-head">
          <h2 id="queue-h">UP NEXT</h2>
          <span>QUEUE &gt;&gt;</span>
        </div>
        {(now?.upcoming ?? []).map((s) => (
          <button
            key={`${s.day}-${s.start}`}
            type="button"
            className="queue-item"
            onClick={(e) => onOpen(s.code, e.currentTarget)}
          >
            <span className="queue-day">{dayShort(s)}</span>
            <span className="queue-name">
              {s.name}
              <small>
                {s.room} · {s.type}
              </small>
            </span>
            <span className="queue-time">{s.start}</span>
          </button>
        ))}
      </section>

      <section className="panel panel-files" aria-labelledby="files-h">
        <div className="panel-head">
          <h2 id="files-h">COURSE FILES</h2>
          <span>{String(courses.length).padStart(2, "0")}</span>
        </div>
        {courses.map((c) => (
          <button
            key={c.code}
            type="button"
            className="file-item"
            style={{ "--tone": `var(--tone-${COURSE_TONES[c.code]})` } as CSSProperties}
            onClick={(e) => onOpen(c.code, e.currentTarget)}
          >
            <i aria-hidden="true" />
            <span>{c.name}</span>
            <code>{c.code}</code>
          </button>
        ))}
      </section>
    </aside>
  );
}
