"use client";

import { Tooltip } from "@radix-ui/themes";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "./motion-presets";
import type { DayId } from "./schedule-data";

interface DayNavItem {
  id: DayId;
  short: string;
  name: string;
}

interface ScheduleBottomNavProps {
  days: readonly DayNavItem[];
  activeDay: DayId;
  onDayClick: (dayId: DayId) => void;
}

export default function ScheduleBottomNav({ days, activeDay, onDayClick }: ScheduleBottomNavProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.nav
      className="schedule-bottom-nav"
      aria-label="เลือกวันเรียน"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 32, x: "-50%" }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, x: "-50%" }}
      transition={{ duration: 0.45, delay: 0.25, ease: EASE_OUT }}
    >
      <div className="nav-day-list">
        {days.map((day) => (
          <Tooltip key={day.id} content={`${day.name} (${day.short})`} side="top">
            <motion.button
              type="button"
              className={`nav-circle-button ${activeDay === day.id ? "active" : ""}`}
              onClick={() => onDayClick(day.id)}
              whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
              transition={{ duration: 0.12 }}
              aria-label={`ไปที่${day.name}`}
              aria-controls={`day-${day.id}`}
              aria-current={activeDay === day.id ? "location" : undefined}
            >
              {activeDay === day.id && (
                <motion.span
                  className="nav-active-pill"
                  layoutId="nav-active-pill"
                  aria-hidden="true"
                  transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
                />
              )}
              <span className="nav-label">{day.short}</span>
            </motion.button>
          </Tooltip>
        ))}
      </div>
    </motion.nav>
  );
}
