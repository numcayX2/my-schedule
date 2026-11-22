"use client";

import { memo, useRef, useState, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type Variants } from "motion/react";
import { COURSE_TONES, getSessionGrid, getSessionTime, type ClassSession } from "./schedule-data";
import { EASE_OUT, EASE_SLAM, INTRO, LIFT_SPRING } from "./motion-presets";

const TILT_SPRING = { stiffness: 260, damping: 20, mass: 0.6 };

interface CardCustom {
  delay: number;
  tilt: number;
  // After the entrance lands, returning to "rest" (hover end) must use the
  // lift spring, not the delayed slam.
  entered: boolean;
}

const cardVariants: Variants = {
  hidden: ({ tilt }: CardCustom) => ({ opacity: 0, scale: 1.22, rotate: tilt }),
  rest: ({ delay, entered }: CardCustom) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: entered
      ? LIFT_SPRING
      : { delay, duration: 0.5, ease: EASE_SLAM, opacity: { delay, duration: 0.16 } },
  }),
  lift: { y: -5, scale: 1.035, transition: LIFT_SPRING },
};

// The hard offset shadow is its own layer moved with transforms, so the
// entrance and hover never repaint a box-shadow.
const shadowVariants: Variants = {
  hidden: { x: 0, y: 0, opacity: 0 },
  rest: ({ delay, entered }: CardCustom) => ({
    x: 5,
    y: 5,
    opacity: 0.84,
    transition: entered ? LIFT_SPRING : { delay, duration: 0.42, ease: EASE_OUT },
  }),
  lift: { x: 11, y: 13, opacity: 1, transition: LIFT_SPRING },
};

function ClassCard({
  session,
  index,
  shouldReduceMotion,
}: {
  session: ClassSession;
  index: number;
  shouldReduceMotion?: boolean | null;
}) {
  const rectRef = useRef<DOMRect | null>(null);
  const [entered, setEntered] = useState(false);

  // Pointer position inside the card, 0..1. Drives tilt and the glare highlight.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-10, 10]), TILT_SPRING);
  const glareX = useTransform(px, (v) => v * 100);
  const glareY = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.75), transparent 56%)`;

  const grid = getSessionGrid(session);
  const interactive = !shouldReduceMotion;
  // Sweep the sheet like a print head: top row first, left to right within a row.
  const delay = INTRO.cards + (grid.gridRowStart - 2) * 0.07 + (grid.gridColumnStart - 2) * 0.014;
  const custom: CardCustom = { delay, tilt: index % 2 === 0 ? -2.5 : 2.5, entered };

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
      className="class-card-slot"
      style={{
        ...grid,
        transformPerspective: 760,
        ...(interactive ? { rotateX, rotateY } : {}),
      }}
      custom={custom}
      variants={cardVariants}
      initial={interactive ? "hidden" : false}
      animate="rest"
      whileHover={interactive ? "lift" : undefined}
      onAnimationComplete={(definition) => {
        if (definition === "rest" && !entered) setEntered(true);
      }}
      onPointerEnter={interactive ? handleEnter : undefined}
      onPointerMove={interactive ? handleMove : undefined}
      onPointerLeave={interactive ? handleLeave : undefined}
    >
      <motion.span className="class-card-shadow" aria-hidden="true" custom={custom} variants={shadowVariants} />
      <div
        className="class-card"
        data-tone={COURSE_TONES[session.code]}
        data-index={String(index + 1).padStart(2, "0")}
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
      </div>
    </motion.article>
  );
}

// Schedule re-renders on cursor hover/click state; cards' props never change.
export default memo(ClassCard);
