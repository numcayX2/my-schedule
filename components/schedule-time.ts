import { CLASSES, DAYS, type ClassSession } from "./schedule-data.ts";

export const START_HOUR = 9;
export const END_HOUR = 21;

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const durationHours = (s: ClassSession) => (toMinutes(s.end) - toMinutes(s.start)) / 60;

export const dayIndex = (s: ClassSession) => DAYS.findIndex((d) => d.id === s.day);

const WEEK = 7 * 1440;
const weekMinute = (s: ClassSession) => dayIndex(s) * 1440 + toMinutes(s.start);

export const SORTED_CLASSES = [...CLASSES].sort((a, b) => weekMinute(a) - weekMinute(b));

export interface NowState {
  /** 0 = Monday .. 4 = Friday, -1 on weekends. */
  todayIndex: number;
  /** Minutes since midnight. */
  minutes: number;
  current: ClassSession | null;
  /** Next sessions after now, wrapping into next week. Never includes `current`. */
  upcoming: ClassSession[];
  /** Minutes from now until upcoming[0] starts. */
  minutesToNext: number | null;
}

export function getNowState(date: Date, count = 3): NowState {
  const weekday = (date.getDay() + 6) % 7; // 0 = Monday
  const minutes = date.getHours() * 60 + date.getMinutes();
  const todayIndex = weekday < 5 ? weekday : -1;
  const nowWeek = weekday * 1440 + minutes;

  const current =
    todayIndex < 0
      ? null
      : CLASSES.find(
          (s) => s.day === DAYS[todayIndex].id && toMinutes(s.start) <= minutes && minutes < toMinutes(s.end),
        ) ?? null;

  const later = SORTED_CLASSES.filter((s) => weekMinute(s) > nowWeek);
  const upcoming = [...later, ...SORTED_CLASSES].filter((s) => s !== current).slice(0, count);

  let minutesToNext: number | null = null;
  if (upcoming[0]) {
    minutesToNext = weekMinute(upcoming[0]) - nowWeek;
    if (minutesToNext <= 0) minutesToNext += WEEK;
  }

  return { todayIndex, minutes, current, upcoming, minutesToNext };
}

/** ISO-8601 week number. */
export function isoWeek(date: Date) {
  const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}

/** Monday of the given date's week at 15:40, for the DEMO clock. */
export function demoDate(base: Date) {
  const d = new Date(base);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(15, 40, 0, 0);
  return d;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const formatSpan = (minutes: number) => `${Math.floor(minutes / 60)}H ${pad2(minutes % 60)}M`;
