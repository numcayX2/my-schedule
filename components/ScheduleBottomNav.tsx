"use client";

import { useEffect, useState } from "react";

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
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 40px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .schedule-bottom-nav.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .nav-circle-button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    color: #ccc;
    font-family: 'Prompt', sans-serif;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-circle-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-circle-button.active {
    background: rgba(255, 92, 0, 0.25);
    border-color: rgba(255, 92, 0, 0.6);
    color: #ff5c00;
    transform: scale(1.05);
  }

  @media (min-width: 641px) {
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

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = NAV_CSS;
    document.head.appendChild(style);

    const handleScroll = () => {
      if (window.innerWidth <= 640) {
        setVisible(true);
        clearTimeout((handleScroll as any).timeout);
        (handleScroll as any).timeout = setTimeout(() => setVisible(false), 2000);
      }
    };

    // Show nav initially on mobile
    if (window.innerWidth <= 640) {
      setVisible(true);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.head.removeChild(style);
      clearTimeout((handleScroll as any).timeout);
    };
  }, []);

  return (
    <nav
      className={`schedule-bottom-nav ${visible ? "visible" : ""}`}
      aria-label="Day navigation"
    >
      {days.map((day) => (
        <button
          key={day.id}
          className={`nav-circle-button ${activeDay === day.id ? "active" : ""}`}
          onClick={() => onDayClick(day.id)}
          aria-label={`Go to ${day.id}`}
        >
          {day.label}
        </button>
      ))}
    </nav>
  );
}