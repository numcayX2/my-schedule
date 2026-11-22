// Motion constants from artifacts/zzz-design-spec.md section 6.
// CSS mirrors these as --snap / --t in components/Schedule.css; keep both in sync.

/** Snap easing: fast and sharp, no bounce. */
export const SNAP = [0.2, 0.9, 0.2, 1] as const;

/** State transitions (hover, active, drawer). Spec range 120-180ms. */
export const TRANSITION_MS = 150;

/** Delay between class cards in the slanted entrance (CSS reads --i). */
export const CARD_STAGGER_MS = 40;

/** Encrypted-text reveal speed per character (Aceternity EncryptedText). */
export const DECODE = {
  title: { revealDelayMs: 55, flipDelayMs: 45 },
  stamp: { revealDelayMs: 28, flipDelayMs: 40 },
} as const;

/** How often the live clock and NOW deck refresh. */
export const CLOCK_TICK_MS = 30_000;
