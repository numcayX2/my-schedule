"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { COURSE_TONES, getSessionGrid, getSessionTime, type ClassSession } from "./schedule-data";
import { EASE_OUT, EASE_SLAM, SHADOW_LIFT, SHADOW_NONE, SHADOW_REST } from "./motion-presets";

const TILT_SPRING = { stiffness: 260, damping: 20, mass: 0.6 };

export default function ClassCard({
  session,
  index,
  shouldReduceMotion,
}: {
  session: ClassSession;
  index: number;
  shouldReduceMotion?: boolean | null;
}) {
  const rectRef = useRef<DOMRect | null>(null);

  // Pointer position inside the card, 0..1. Drives tilt and the glare highlight.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-10, 10]), TILT_SPRING);
  const glareX = useTransform(px, (v) => v * 100);
  const glareY = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.75), transparent 56%)`;

  const interactive = !shouldReduceMotion;
  const delay = 0.32 + Math.min(index, 28) * 0.045;
  const tilt = index % 2 === 0 ? -2.5 : 2.5;

  const handleEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    rectRef.current = event.currentTarget.getBoundingClientRect();
  };
  const handleMove = (event: PointerEvent<HTMLElement>) => {
    const rect = rectRef.current;
    if (event.pointerType !== "mouse" || !rect) return;
    px.set(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)));
    py.set(Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)));
  };
  const handleLeave = () => {
    rectRef.current = null;
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      className="class-card"
      data-tone={COURSE_TONES[session.code]}
      data-index={String(index + 1).padStart(2, "0")}
      style={{
        ...getSessionGrid(session),
        transformPerspective: 760,
        ...(interactive ? { rotateX, rotateY } : {}),
      }}
      initial={interactive ? { opacity: 0, scale: 1.22, rotate: tilt, boxShadow: SHADOW_NONE } : false}
      animate={interactive ? { opacity: 1, scale: 1, rotate: 0, boxShadow: SHADOW_REST } : {}}
      transition={{
        delay,
        duration: 0.5,
        ease: EASE_SLAM,
        opacity: { delay, duration: 0.16 },
        boxShadow: { delay, duration: 0.42, ease: EASE_OUT },
      }}
      whileHover={
        interactive
          ? {
              y: -5,
              scale: 1.035,
              boxShadow: SHADOW_LIFT,
              transition: { type: "spring", stiffness: 380, damping: 24 },
            }
          : undefined
      }
      onPointerEnter={interactive ? handleEnter : undefined}
      onPointerMove={interactive ? handleMove : undefined}
      onPointerLeave={interactive ? handleLeave : undefined}
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
      {interactive && <motion.span className="class-card-glare" aria-hidden="true" style={{ backgroundImage: glare }} />}
    </motion.article>
  );
}
