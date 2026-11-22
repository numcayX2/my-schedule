<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# my-schedule: Design Rules (Zenless Zone Zero style)

Source of truth: `artifacts/zzz-design-spec.md`. Read it before any UI work. If this file and the spec disagree, the spec wins. Update the spec first, then this file.

The spec was derived from 79 in-game ZZZ UI screenshots (`C:\Users\Acer\Pictures\ZZZ_finetune`). Hex values are approximate until verified against the originals.

This replaces the earlier generic "ZZZ Design Language" guide. That guide told you to use hazard elements heavily and to use hot pink/purple. Both are wrong for this project.

## Core idea

Dark matte base, one acid-yellow accent, diagonal cuts against pill buttons, huge numerals, and every screen treated as a physical object (VHS, binder, sticker, phone bezel). Signature elements go on frames, backgrounds, and focus points. Never on the schedule content itself.

## Hard rules

1. **Readability first.** Class names, times, rooms, and instructors must stay clear. Text contrast must meet WCAG AA (4.5:1). Never put hazard stripes or halftone behind text that has to be read.
2. **One accent.** `--accent` (`#E5FE10`) marks active, focus, CTA, and "today" only, at most ~10% of the page. `--warn` / `--danger` / `--info` are semantic only, never decoration.
3. **Shape contrast.** Cards, tabs, and headers are cut at 45° (`clip-path` chamfer) or parallelogram (skew with counter-skew on text). Buttons, chips, toggles, and filters are pills. Close buttons are red circles.
4. **Shadows.** Hard offset only (`4px 4px 0 #000`). No soft shadows, no glassmorphism, no purple-pink gradients.
5. **Typography.** Display = Anton (heavy condensed uppercase, can be skewed). Thai and body text = Prompt (sans-serif). Load both through `next/font/google`. Numerals = bold, `tabular-nums`. Body = clean sans. Do not skew or fake-italic Thai text, and do not use display faces for long Thai copy. Pair English uppercase graphic headings with Thai content.
6. **Signature elements are rationed.** At most 1-2 hazard stripes per page. Sticker tags (`NOW`, `NEXT`, `TODAY`) are slanted tape or pill, rotated -3° to -6°. Giant ghost watermark text sits at 4-8% opacity behind panels.
7. **Motion.** Fast and sharp, 120-180ms, snap easing, staggered slanted entry. No soft bounce. Always honor `prefers-reduced-motion`.
8. **Copy.** No emoji. No marketing or filler wording. Thai body with English technical terms.

## Tokens

Use the CSS custom properties defined in the spec (section 2). Do not hardcode hex values in components. If a needed token is missing, add it to the spec and the stylesheet together.

## Component mapping

| Area | Treatment |
|---|---|
| Page header | Skewed display type, giant watermark, serial stamp (term / academic year) |
| Day tabs | Parallelogram tabs, today filled with accent |
| Time grid | Thin `--line` grid, tabular time headers, panel background |
| Class card | Single-corner chamfer, subject colour as left edge bar only, large time numerals, room/section as label |
| Status tags | Slanted tape (`NOW`, `NEXT`) |
| Buttons / filters | Pill |
| Backdrop | Ghost watermark text plus grain, one hazard stripe |

## Workflow

- Existing animation work lives in `components/motion-presets.ts` and `components/Schedule.css`. Extend it; do not duplicate presets.
- Stack: Next.js 16, React 19, Radix UI Themes, `motion`. Check the spec's open question on whether Radix Themes stays before adding new Radix-dependent styling.
- Before declaring UI work done, check at desktop and mobile widths, keyboard focus visibility, contrast, and reduced-motion behavior.
- Do not commit unrelated uncommitted changes together with design work.
