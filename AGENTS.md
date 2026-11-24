<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# my-schedule: Design Rules (Zenless Zone Zero style)

Source of truth: `artifacts/zzz-design-spec.md` (v2). Read it before any UI work. If this file and the spec disagree, the spec wins. Update the spec first, then this file.

The spec was derived and pixel-measured from 79 full-resolution (`2560×1440`) in-game ZZZ UI screenshots (`C:\Users\Acer\Pictures\ZZZ_finetune`).

This replaces the earlier generic "ZZZ Design Language" guide (heavy yellow/black hazard stripes, hot pink/purple, 45° chamfers, brutalist hard offset shadows). Those do not match the real in-game UI.

## Core idea

Pure neutral matte charcoal base (no blue tint), one yellow-lime accent family (`--accent` `#E6D600`, pulsing `#B8CC00 ↔ #FCDD00` on active tabs), chunky layered hardware framing with asymmetric rounded corners, dark recessed troughs holding slanted-edge active tabs, huge tabular numerals, and physical hardware objects (metal bezel calendar, cassette deck, warm grey-cream dossier). Signature elements go on frames, backgrounds, and focus points—never behind readable schedule text.

## Hard rules

1. **Readability first.** Class names, times, rooms, and instructors must stay clear. Text contrast must meet WCAG AA (4.5:1). Never put halftone or heavy patterns behind text that has to be read.
2. **One accent family.** `--accent` (`#E6D600`, pulse range `--accent-lime` `#B8CC00` to `--accent-peak` `#FCDD00`, micro-tag `--accent-tag` `#FFFF04`) marks active, focus, CTA, and "today" only, at most ~10% of the page. `--warn` / `--danger` / `--info` / `--success` are semantic only, never decoration. Exception: the progress gauge uses the game-matched orange `--progress-*` tokens (spec 2.1), and only the gauge may use them.
3. **Shape & hardware language.** Panels, modals, and cards use chunky rounded corners (`16–26px`) with asymmetric corner radii (3 large radii + 1 tighter corner) and layered borders (`--line` + `#000` + subtle top inset highlight)—NOT 45° `clip-path` chamfers. Tab and filter groups sit in dark recessed pill troughs (`--bg-void`), with active tabs slanted on the side edge (~15–20°). Close buttons are asymmetrical tilted squircles in `--close-bg` (`#C01C00`) with bright `--close-rim` (`#E3421F`) and a **bold black `×`**—NOT red circles with white X. Empty slots are solid dark blocks with a bold `X` and `EMPTY` / `NO CLASS` label—NOT dashed wireframes.
4. **Depth, not shadows.** Use layered hardware casings, inset bevels, and recessed dark troughs. No neo-brutalist hard offset shadows (`4px 4px 0 #000`), no soft drop shadows, no glassmorphism, and no purple-pink gradients.
5. **Typography.** Display = Anton (heavy condensed uppercase, can be skewed `-8deg`). Thai and body text = Prompt (sans-serif, 400/600/800). Sub-labels, rooms, codes, and metadata = Kanit (500/600/700, loopless Thai+Latin, `tabular-nums` — never terminal monospace like Cascadia Mono/Consolas). Load all three through `next/font/google`. Numerals = bold, `tabular-nums`. Do not skew or fake-italic Thai text, and do not use display faces for long Thai copy. Pair English uppercase graphic headings with Thai content.
6. **Signature elements are rationed.** Dark 45° diagonal stripes (`#0B0B0B` / `#141414`) for backdrop/shells (no yellow/black hazard stripes). Fine micro-dot headers and corner-only halftone. Tilted yellow black-outlined `NEW!` micro-tags (`#FFFF04`). Giant angled ghost watermark text at 4–8% opacity behind panels. Vertical 90° spine labels (`SCHEDULE`, `DATA FILE`).
7. **Motion.** Fast and sharp, 120–180ms, snap easing, pop-up (`scale` + `opacity`) for cards and modals (never slide-up), sliding `layoutId` active tabs, optional slow lime↔yellow pulse on active tabs. No soft bounce. Always honor `prefers-reduced-motion`.
8. **Copy.** No emoji. No marketing or filler wording. Thai body with English technical terms.

## Tokens

Use the pixel-measured CSS custom properties defined in the spec (section 2). Do not hardcode hex values in components or `Schedule.css`. If a needed token is missing, add it to the spec and the stylesheet together.

## Component mapping

| Area | Treatment |
|---|---|
| Page header | Skewed display type, giant angled watermark, serial stamp (term / academic year), dark diagonal-striped backdrop |
| Topbar / filters | Recessed dark pill troughs (`--bg-void` + `--line` rim); active option = slanted `--accent` tab |
| Day tabs | Desktop board: dark pill tabs (`--tab-bg`/`--tab-border`), today = game active tab (`--accent`, slanted left edge, round right cap). Mobile dock: dark recessed bottom dock with slanted tabs |
| Time grid | Neutral `--grid-hour` / `--grid-half` lines, tabular time headers in bevelled grey strip (`--strip`, active hour `--strip-now` `#DADADA`) |
| Class card | Game event-row style: full subject-colour rounded bar (never `--accent`, `--warn`, or `--info`), 2px darker inset outline, `#111` ink, black round `LEC`/`LAB` button, corner-only halftone (spec 2.3) |
| NOW deck & secondary panels | Asymmetric rounded hardware frames with layered borders and micro-dot headers; vertical spine on NOW deck; orange chevron progress gauge (spec 2.1) |
| Empty slots | Solid dark recessed block with bold centered `X` and `NO CLASS` / `EMPTY` label |
| Status tags | Tilted yellow black-outlined micro-tag (`NEW!`, `TODAY`) or black-outlined category pills |
| Course Dossier | Dark ZZZ hardware modal (`#68`/`#69`/`#70`) with micro-dot header, tilted `--close-bg` squircle close button with bold black `×`, inner stitched warm grey-cream folder card (`--paper` `#C4BFB0` from `#74` with black-outlined pills & recessed dark data strips), and dark recessed `SESSIONS >>` pill rack |
| Week board frame | Game event-calendar frame: striped dark shell, speckled grey metal bezel (`--metal` `#8C8A8A`) with dashed seam and 3 binding tabs, `--viewport` `#1D1D1E`, bevelled grey hour strip, `NOW` pill + stem (spec 2.2) |
| Progress gauge | Game-style orange bar: black rim, dark grey casing, pill caps, golden-to-orange fill (`#F9B636`→`#EF580C`), chevron bands, outlined centred numbers, circular metal badge |

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
