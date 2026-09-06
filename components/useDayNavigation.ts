"use client";

import { useEffect, useRef, useState } from "react";
import { DAYS, type DayId } from "./schedule-data";

// Pick the last heading above a fixed reading line. Between headings, the
// preceding day stays selected. This also works for Wednesday's empty section.
export const DAY_READING_LINE = 96;
const DAY_SCROLL_INSET = 24;

export default function useDayNavigation() {
  const dayRefs = useRef<Partial<Record<DayId, HTMLElement | null>>>({});
  const [activeDay, setActiveDay] = useState<DayId>("mon");
  const scrollActionRef = useRef<(day: DayId) => void>(() => {});

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let settleTimer = 0;
    let scrollingToDay = false;

    const updateActiveDay = () => {
      frame = 0;
      if (!mobile.matches) return;
      const sections = DAYS.flatMap(({ id }) => {
        const element = dayRefs.current[id];
        return element ? [{ id, top: element.getBoundingClientRect().top }] : [];
      });
      let selected = sections[0]?.id ?? "mon";
      for (const section of sections) {
        if (section.top <= DAY_READING_LINE) selected = section.id;
      }
      // The last heading may not reach the reading line on a tall viewport.
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY >= maxScroll - 2) selected = "fri";
      setActiveDay(selected);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveDay);
    };
    const finishScroll = () => {
      scrollingToDay = false;
      window.clearTimeout(settleTimer);
      scheduleUpdate();
    };
    const onScroll = () => {
      scheduleUpdate();
      window.clearTimeout(settleTimer);
      // Fallback for browsers without scrollend; never locks the highlighted day.
      settleTimer = window.setTimeout(finishScroll, 150);
    };
    const interruptScroll = () => {
      if (scrollingToDay) {
        window.scrollTo({ top: window.scrollY, behavior: "instant" });
      }
      finishScroll();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape", "Tab"].includes(event.key)) {
        interruptScroll();
      }
    };
    const onPreferenceChange = () => {
      if (reducedMotion.matches) interruptScroll();
    };

    scrollActionRef.current = (dayId) => {
      const target = dayRefs.current[dayId];
      if (!target || !mobile.matches) return;
      window.clearTimeout(settleTimer);
      scrollingToDay = !reducedMotion.matches;
      window.scrollTo({
        top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - DAY_SCROLL_INSET),
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
      // Also update when the destination is already in view (no scroll event).
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", finishScroll);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("wheel", interruptScroll, { passive: true });
    window.addEventListener("touchstart", interruptScroll, { passive: true });
    window.addEventListener("pointerdown", interruptScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    reducedMotion.addEventListener("change", onPreferenceChange);
    mobile.addEventListener("change", scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    DAYS.forEach(({ id }) => {
      const section = dayRefs.current[id];
      if (section) resizeObserver.observe(section);
    });
    scheduleUpdate();

    return () => {
      scrollActionRef.current = () => {};
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", finishScroll);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("wheel", interruptScroll);
      window.removeEventListener("touchstart", interruptScroll);
      window.removeEventListener("pointerdown", interruptScroll);
      window.removeEventListener("keydown", onKeyDown);
      reducedMotion.removeEventListener("change", onPreferenceChange);
      mobile.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  return { dayRefs, activeDay, scrollToDay: (day: DayId) => scrollActionRef.current(day) };
}
