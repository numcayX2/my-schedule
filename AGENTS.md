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
2. **One accent.** `--accent` (`#E5FE10`) marks active, focus, CTA, and "today" only, at most ~10% of the page. `--warn` / `--danger` / `--info` are semantic only, never decoration. Exception: the progress gauge uses the game-matched orange `--progress-*` tokens (spec 2.1), and only the gauge may use them.
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
| Day tabs | Desktop board: dark pill tabs, today = game active tab (accent, slanted left edge, round right cap). Mobile dock: parallelogram tabs, today filled with accent |
| Time grid | Thin `--line` grid, tabular time headers, panel background |
| Class card | Game event-row style: full subject-colour rounded bar (never the accent colour), 2px darker outline, black text, black round LEC/LAB button, halftone only in the corner (spec 2.3) |
| Status tags | Slanted tape (`NOW`, `NEXT`) |
| Buttons / filters | Pill |
| Backdrop | Ghost watermark text plus grain |
| Week board frame | Game event-calendar frame: striped shell, grey metal bezel with seam and binding tabs, dark viewport, bevelled grey hour strip, NOW pill + stem (spec 2.2) |
| Progress gauge | Game-style orange bar: black rim, pill caps, golden-to-orange fill, chevron bands, outlined centred numbers, circular icon badge |

## Workflow

- Stack: Next.js 16, React 19, `motion`, Tailwind v4 (scoped). Radix UI Themes was removed; do not reintroduce it.
- Styling: `components/Schedule.css` holds every ZZZ token and component style. Tailwind is imported without preflight in `app/globals.css` and scans only `components/ui`. Use it only for Aceternity components copied into `components/ui`.
- Aceternity UI: copy a component from `https://ui.aceternity.com/registry/<name>.json` into `components/ui`, then adapt it: no hydration-unsafe randomness during render, honor `prefers-reduced-motion`, valid ARIA, and no glow, glass, gradient or tilt effects (spec section 8). Currently used: `EncryptedText` (h1, file stamp, dossier code). Never scramble Thai text.
- Motion constants live in `components/motion-presets.ts`; CSS mirrors them as `--snap`, `--t`, `--stagger`. Change both together.
- Time logic lives in `components/schedule-time.ts` (pure, tested). The clock is client-only (`useSyncExternalStore` with a null server snapshot), so time-dependent UI never causes hydration mismatches. `#demo` in the URL starts the DEMO clock (Monday 15:40) for QA.
- Mobile (<= 768px) uses `useDayNavigation` with a bottom day dock. Its reading line (96px) and scroll inset (24px) assume nothing is fixed at the top of the viewport.
- Tests: `node --test tests/*.mjs` (a bare `node --test tests/` fails on this setup). Also run `npm run lint` and `npm run build`.
- Before declaring UI work done, check at desktop and mobile widths, keyboard focus visibility, contrast, and reduced-motion behavior.
- Do not commit unrelated uncommitted changes together with design work.
