"use client";

import { useEffect, useRef, useState } from "react";

interface DayNavItem {
  id: string;
  label: string;
}

interface ScheduleBottomNavProps {
  days: DayNavItem[];
  activeDay: string;
  onDayClick: (dayId: string) => void;
}

const NAV_CSS = `
  .schedule-bottom-nav {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    background: rgba(25, 26, 28, 0.78);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 50px;
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.6), 
      inset 0 1px 1px rgba(255, 255, 255, 0.1),
      inset 0 -1px 1px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .schedule-bottom-nav.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }

  /* Hide native cursor to let global ink cursor take over */
  @media (hover: hover) and (pointer: fine) {
    .schedule-bottom-nav button {
      cursor: none !important;
    }
  }

  .nav-pill-indicator {
    position: absolute;
    height: calc(100% - 12px);
    top: 6px;
    background: rgba(255, 105, 31, 0.16);
    border: 1px solid rgba(255, 105, 31, 0.46);
    border-radius: 50px;
    box-shadow: 0 0 16px rgba(255, 105, 31, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: left 0.45s cubic-bezier(0.16, 1, 0.3, 1), width 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1;
  }

  .nav-circle-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #888;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 13px;
    transition: color 0.3s ease, transform 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    z-index: 2;
    position: relative;
  }

  .nav-circle-button:hover {
    color: #fff;
  }
  
  .nav-circle-button:active {
    transform: scale(0.9);
  }

  .nav-circle-button.active {
    color: var(--orange);
    text-shadow: 0 0 8px rgba(255, 105, 31, 0.55);
  }

  @media (min-width: 769px) {
    .schedule-bottom-nav {
      display: none;
    }
  }
`;

export default function ScheduleBottomNav({
  days,
  activeDay,
  onDayClick,
}: ScheduleBottomNavProps) {
  const [visible, setVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        setVisible(true);

        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
          setVisible(false);
        }, 2500);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const activeIndex = Math.max(
    0,
    days.findIndex((d) => d.id === activeDay),
  );

  const indicatorLeft = 6 + activeIndex * 44;
  const indicatorWidth = 40;

  return (
    <>
      <style>{NAV_CSS}</style>
      <nav
        className={`schedule-bottom-nav ${visible ? "visible" : ""}`}
        aria-label="Day navigation"
      >
        <div
          className="nav-pill-indicator"
          style={{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }}
        />
        {days.map((day) => (
          <button
            key={day.id}
            className={`nav-circle-button ${activeDay === day.id ? "active" : ""}`}
            onClick={() => onDayClick(day.id)}
            aria-label={`Go to ${day.id}`}
            aria-current={activeDay === day.id ? "page" : undefined}
          >
            {day.label}
          </button>
        ))}
      </nav>
    </>
  );
}
