"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

// Fixed background layers that give the page depth: a warm glow that drifts
// with scroll, a cursor spotlight (mouse only) and a scroll-progress bar.
export default function AmbientBackdrop({
  mouseX,
  mouseY,
  cursorActive,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  cursorActive: boolean;
}) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });

  const driftX = useTransform(progress, [0, 1], ["78vw", "6vw"]);
  const driftY = useTransform(progress, [0, 1], ["-8vh", "72vh"]);

  const spotSpringX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const spotSpringY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const spotX = useTransform(spotSpringX, (v) => v - 380);
  const spotY = useTransform(spotSpringY, (v) => v - 380);

  return (
    <>
      <motion.div className="scroll-progress" aria-hidden="true" style={{ scaleX: progress }} />
      <div className="ambient" aria-hidden="true">
        <motion.div className="ambient-drift" style={{ x: driftX, y: driftY }} />
        <motion.div
          className="ambient-spot"
          style={{ x: spotX, y: spotY }}
          animate={{ opacity: cursorActive ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </>
  );
}
