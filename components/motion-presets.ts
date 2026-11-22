// Shared easing curves so every entrance feels like part of one system.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
// Overshoots slightly: used for "stamp slammed onto paper" moments.
export const EASE_SLAM = [0.34, 1.56, 0.64, 1] as const;

// Spring for pointer-driven states (hover lift, settle back): hard and snappy,
// like a game menu cursor. No delay, so it never inherits an entrance stagger.
export const LIFT_SPRING = { type: "spring", stiffness: 620, damping: 32 } as const;

// Page intro timeline (seconds from first paint). One place to read and retime
// the whole sequence: rail -> header -> title -> board -> cards -> stamps.
export const INTRO = {
  header: 0.06,
  titleLine1: 0.16,
  dashboard: 0.18,
  board: 0.24,
  nav: 0.25,
  titleLine2: 0.3,
  mobileFirstDay: 0.3,
  cards: 0.32,
  sticker: 0.55,
  count: 0.55,
  glitch: 0.95,
  accent: 1.1,
  // Count-up (starts at `count`, 1.2s) is nearly done: SFX hits on the landing.
  sfx: 1.6,
} as const;
